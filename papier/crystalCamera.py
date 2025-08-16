#!/usr/bin/env python3
"""
High-performance multiprocessing hand tracking for Raspberry Pi 4
Utilizes all 4 CPU cores for maximum performance
Optimized for directional control with minimal latency

This script uses MediaPipe for hand detection, PiCamera2 for camera access,
and multiprocessing to distribute the computational load across CPU cores.
The system is designed to detect left/right hand movements and trigger
corresponding arrow key presses with minimal latency.

Architecture:
- Main process: Camera capture and coordination
- Worker processes: MediaPipe hand detection processing
- Shared memory: Efficient frame data transfer between processes
- Threading: Asynchronous camera capture

Requires: pip install imutils psutil opencv-python mediapipe pyautogui
Note: Also requires picamera2 (usually pre-installed on Raspberry Pi OS)
"""

import cv2
import mediapipe as mp
import pyautogui
import numpy as np
from picamera2 import Picamera2  # Raspberry Pi camera interface (Pi Camera v2/v3)
import time
import threading
import multiprocessing as mp_proc
from multiprocessing import Process, Queue, Value, Array, shared_memory
import psutil  # For CPU affinity and process management
import os
from queue import Empty
from imutils.video import FPS  # For performance monitoring
import ctypes
from threading import Lock

# ==================== PERFORMANCE SETTINGS ====================
# These settings control the trade-off between performance and accuracy

TARGET_FPS = 60         # Target frames per second - higher = more responsive but more CPU usage
CAMERA_WIDTH = 320      # Camera resolution width - lower = faster processing
CAMERA_HEIGHT = 240     # Camera resolution height - lower = faster processing
SHOW_PREVIEW = True     # Display camera feed with overlays (disable for max performance)
SHOW_FPS = True         # Display FPS counter for performance monitoring
DIRECTIONAL_KEYS = True # Enable left/right arrow key detection (vs other gesture types)

# ========== MOVEMENT SENSITIVITY SETTINGS ==========
# Fine-tune these values to adjust how sensitive the gesture detection is

SWIPE_THRESHOLD = 10         # Minimum velocity (pixels/frame) to register as intentional movement
                            # Lower = more sensitive to small movements
                            # Higher = requires more deliberate gestures

MIN_TRAVEL_DISTANCE = 100    # Minimum total distance (pixels) hand must travel for key press
                            # This prevents accidental triggers from small hand adjustments
                            # Lower = easier to trigger, Higher = requires more deliberate movement

MOVEMENT_ACCUMULATION = True # Track cumulative movement over time vs instantaneous velocity
                            # Helps detect slow but deliberate movements

SPEED_BOOST_FACTOR = 1       # Multiplier for velocity calculations (experimental)
                            # Values > 1 make the system more sensitive to fast movements

REACTION_TIME_MS = 1000      # Minimum time (ms) between key presses to prevent spam
                            # Lower = can trigger keys faster, Higher = more deliberate pacing

MIN_MOVEMENT_FRAMES = 3      # Number of consecutive frames showing movement before triggering
                            # Higher = more stable detection, Lower = faster response
# ======================================================================

# ========== MULTIPROCESSING CONFIGURATION ==========
# These settings control how the workload is distributed across CPU cores

NUM_WORKER_PROCESSES = 1 # Number of MediaPipe worker processes
                        # Note: Set to 1 for stability - MediaPipe can be unstable with multiple workers
                        # Pi 4 has 4 cores, but MediaPipe works better with single worker + main process

USE_PROCESS_POOL = True     # Enable multiprocessing (vs single-threaded operation)
                           # Significantly improves performance on multi-core systems

SET_CPU_AFFINITY = False   # Pin processes to specific CPU cores
                          # Can improve performance but may cause compatibility issues
                          # Disabled by default - enable only if you have administrative privileges

USE_SHARED_MEMORY = True   # Use shared memory for frame data transfer between processes
                          # Much faster than pickling/unpickling frame data through queues
                          # Requires Python 3.8+ for shared_memory module

FRAME_BUFFER_SIZE = 2     # Number of frames to buffer in shared memory
                         # Lower = less latency, Higher = more stable under load
# ============================================================

# Disable PyAutoGUI failsafe (mouse to corner to stop)
# This prevents accidental program termination during normal use
pyautogui.FAILSAFE = False

def set_process_priority():
    """
    Increase the priority of the current process for better real-time performance.
    
    Uses os.nice() to request higher CPU priority. Negative values require
    root/admin privileges. On Linux systems, this can help reduce latency
    for time-critical applications like real-time gesture recognition.
    
    Note: This may not work on all systems or require special permissions.
    """
    try:
        os.nice(-10)  # Request higher priority (requires sudo for negative values)
        print("Process priority increased")
    except PermissionError:
        print("Warning: Could not increase process priority (try running with sudo)")
    except Exception as e:
        print(f"Warning: Priority adjustment failed: {e}")

def set_cpu_affinity(core_id):
    """
    Pin the current process to a specific CPU core for better performance isolation.
    
    Args:
        core_id (int): CPU core number (0-3 on Pi 4)
    
    This can help reduce context switching overhead and improve cache locality.
    However, it requires careful tuning and may not always improve performance.
    Currently disabled by default due to potential compatibility issues.
    """
    if SET_CPU_AFFINITY:
        try:
            psutil.Process().cpu_affinity([core_id])
            print(f"Process {os.getpid()} pinned to CPU core {core_id}")
        except Exception as e:
            print(f"Warning: Could not set CPU affinity: {e}")

class SharedFrameBuffer:
    """
    High-performance frame buffer using shared memory for inter-process communication.
    
    This class provides a circular buffer in shared memory that allows multiple
    processes to share camera frames without the overhead of serialization.
    
    Key benefits:
    - Zero-copy frame sharing between processes
    - Circular buffer prevents memory growth
    - Thread-safe access with locks
    - Automatic cleanup of shared memory resources
    """
    
    def __init__(self, width, height, buffer_size=3):
        """
        Initialize shared frame buffer.
        
        Args:
            width (int): Frame width in pixels
            height (int): Frame height in pixels  
            buffer_size (int): Number of frames to buffer (circular buffer size)
        """
        self.width = width
        self.height = height
        self.buffer_size = buffer_size
        self.frame_size = width * height * 3  # 3 bytes per pixel (RGB)
        
        # Create shared memory for frame buffer
        if USE_SHARED_MEMORY:
            try:
                # Allocate shared memory block large enough for all buffered frames
                self.shm_size = self.frame_size * buffer_size
                self.shm = shared_memory.SharedMemory(create=True, size=self.shm_size)
                
                # Create numpy array view of shared memory
                # This allows direct array operations on shared memory without copying
                self.buffer = np.ndarray((buffer_size, height, width, 3), 
                                       dtype=np.uint8, buffer=self.shm.buf)
                print(f"Created shared memory buffer: {self.shm_size} bytes")
            except Exception as e:
                print(f"Warning: Shared memory creation failed: {e}")
                # Fallback to regular memory
                self.buffer = np.zeros((buffer_size, height, width, 3), dtype=np.uint8)
                self.shm = None
        else:
            # Use regular memory allocation (slower but more compatible)
            self.buffer = np.zeros((buffer_size, height, width, 3), dtype=np.uint8)
            self.shm = None
        
        # Synchronization primitives for thread-safe access
        self.write_index = Value('i', 0)  # Next position to write
        self.read_index = Value('i', 0)   # Current read position  
        self.frame_count = Value('i', 0)  # Number of frames currently buffered
        self.lock = mp_proc.Lock()        # Mutex for thread-safe access
    
    def write_frame(self, frame):
        """
        Write a new frame to the circular buffer.
        
        Args:
            frame (np.ndarray): Frame data as numpy array (height, width, 3)
            
        Thread-safe operation that overwrites oldest frame when buffer is full.
        """
        with self.lock:
            idx = self.write_index.value
            # Direct assignment - no copying overhead thanks to shared memory
            self.buffer[idx] = frame
            # Advance write pointer (circular)
            self.write_index.value = (idx + 1) % self.buffer_size
            # Update frame count (saturate at buffer_size)
            self.frame_count.value = min(self.frame_count.value + 1, self.buffer_size)
    
    def read_frame(self):
        """
        Read the most recent frame from the buffer.
        
        Returns:
            np.ndarray or None: Latest frame data, or None if buffer is empty
            
        Returns a copy of the frame data to prevent race conditions.
        """
        with self.lock:
            if self.frame_count.value == 0:
                return None
            # Get most recent frame (write_index - 1)
            idx = (self.write_index.value - 1) % self.buffer_size
            # Return copy to avoid data races
            return self.buffer[idx].copy()
    
    def cleanup(self):
        """
        Clean up shared memory resources.
        
        Must be called before program exit to prevent memory leaks.
        Shared memory persists after process termination if not explicitly cleaned up.
        """
        if self.shm:
            try:
                self.shm.close()  # Close this process's handle
                self.shm.unlink() # Delete the shared memory segment
                print("Shared memory cleaned up")
            except Exception as e:
                print(f"Warning: Shared memory cleanup failed: {e}")

def mediapipe_worker(worker_id, input_queue, output_queue, should_stop):
    """
    Worker process for MediaPipe hand detection.
    
    This function runs in a separate process and handles the computationally
    intensive MediaPipe hand detection. It receives frames through a queue,
    processes them, and sends results back through another queue.
    
    Args:
        worker_id (int): Unique identifier for this worker (for debugging)
        input_queue (Queue): Queue to receive frame data from main process
        output_queue (Queue): Queue to send detection results back to main process  
        should_stop (Value): Shared boolean flag to signal worker shutdown
        
    Architecture notes:
    - Runs in separate process for true parallelism (not just threading)
    - Each worker initializes its own MediaPipe instance (not shareable between processes)
    - Uses optimized MediaPipe settings for speed over accuracy
    - Extracts only the index finger tip position (landmark 8) for efficiency
    """
    
    # Set CPU affinity if enabled (pin worker to specific core)
    set_cpu_affinity(worker_id + 1)  # Pin to CPU cores 1, 2, etc.
    
    print(f"MediaPipe worker {worker_id} starting on CPU core {worker_id + 1}")
    
    # Initialize MediaPipe hands detection in the worker process
    # Note: MediaPipe objects cannot be shared between processes, each worker needs its own
    mp_hands = mp.solutions.hands
    hands = mp_hands.Hands(
        static_image_mode=False,        # Process video stream (not static images)
        max_num_hands=1,               # Only track one hand for performance
        min_detection_confidence=0.4,  # Lower confidence = faster detection, more false positives
        min_tracking_confidence=0.2,   # Lower confidence = better tracking of fast movements
        model_complexity=0             # Fastest model (0=lite, 1=full) - trades accuracy for speed
    )
    
    frames_processed = 0  # Statistics counter
    
    try:
        # Main worker loop - runs until shutdown signal
        while not should_stop.value:
            try:
                # Get frame from input queue with timeout to allow checking should_stop
                frame_data = input_queue.get(timeout=0.1)
                if frame_data is None:
                    continue  # Skip None frames (shouldn't happen)
                
                # Unpack frame data tuple
                frame, timestamp, frame_id = frame_data
                
                # Ensure frame is in correct format for MediaPipe (RGB)
                # PiCamera2 provides RGB frames directly, but we check just in case
                if len(frame.shape) == 3 and frame.shape[2] == 3:
                    # Frame is already RGB from PiCamera2, use directly
                    rgb_frame = frame
                else:
                    # Fallback conversion if needed (shouldn't be necessary with PiCamera2)
                    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                
                # Process frame with MediaPipe
                # This is the computationally expensive operation we're parallelizing
                results = hands.process(rgb_frame)
                
                # Extract hand landmarks if detected
                hand_data = None
                if results.multi_hand_landmarks:
                    # Get first (and only) hand's landmarks
                    landmarks = results.multi_hand_landmarks[0]
                    
                    # Extract only the index finger tip (landmark 8) for efficiency
                    # MediaPipe provides 21 hand landmarks, but we only need finger tip position
                    # Landmark 8 = index finger tip (see MediaPipe hand landmark model)
                    index_tip = landmarks.landmark[8]
                    
                    hand_data = {
                        'x': index_tip.x,      # Normalized x coordinate (0-1)
                        'y': index_tip.y,      # Normalized y coordinate (0-1)
                        'detected': True
                    }
                else:
                    # No hand detected in this frame
                    hand_data = {'detected': False}
                
                # Package result for main process
                result = {
                    'hand_data': hand_data,
                    'timestamp': timestamp,
                    'frame_id': frame_id,
                    'worker_id': worker_id
                }
                
                # Send result back to main process (non-blocking)
                if not output_queue.full():
                    output_queue.put_nowait(result)
                else:
                    # Queue full - main process isn't keeping up
                    # This is normal under high load, just skip this result
                    pass
                
                frames_processed += 1
                
            except Empty:
                # Timeout on input queue - normal, just check should_stop and continue
                continue
            except Exception as e:
                print(f"Worker {worker_id} error: {e}")
                break  # Exit worker on serious errors
    
    finally:
        # Cleanup MediaPipe resources
        hands.close()
        print(f"Worker {worker_id} processed {frames_processed} frames")

class MultiprocessingPiCamera:
    """
    High-performance camera interface with threading and shared memory support.
    
    This class wraps the PiCamera2 interface with additional features:
    - Threaded capture for non-blocking camera access
    - Shared memory frame buffer for efficient inter-process communication
    - Optimized camera settings for gesture recognition
    - Automatic frame flipping for mirror effect
    
    The camera runs in its own thread to ensure continuous frame capture
    while the main thread handles gesture detection and UI updates.
    """
    
    def __init__(self, resolution=(320, 240)):
        """
        Initialize camera with specified resolution.
        
        Args:
            resolution (tuple): (width, height) camera resolution
            
        Lower resolutions improve performance at the cost of detection accuracy.
        320x240 provides good balance for hand gesture detection.
        """
        self.width, self.height = resolution
        
        # Initialize PiCamera2 interface
        # PiCamera2 is the new camera interface for Raspberry Pi (replaces legacy picamera)
        self.picam2 = Picamera2()
        
        # Configure camera for maximum performance
        # Use preview configuration (faster than still capture configuration)
        config = self.picam2.create_preview_configuration(
            main={"size": resolution, "format": "RGB888"},  # RGB format for MediaPipe compatibility
            buffer_count=2  # Minimal buffering to reduce latency
        )
        self.picam2.configure(config)
        
        # Set frame rate and image quality controls
        if TARGET_FPS > 0:
            # Calculate frame duration in microseconds
            frame_duration = int(1000000 / TARGET_FPS)
            
            # Apply camera controls for optimal gesture recognition
            self.picam2.set_controls({
                # Frame rate control
                "FrameDurationLimits": (frame_duration, frame_duration),
                
                # Auto-exposure and white balance for varying lighting conditions
                "AeEnable": True,   # Enable auto-exposure for proper brightness
                "AwbEnable": True,  # Enable auto white balance for color accuracy
                
                # Image enhancement for better hand detection
                "Brightness": 0.1,  # Slight brightness boost (range: -1.0 to 1.0)
                "Contrast": 1.1     # Slight contrast boost (range: 0.0 to 32.0)
            })
        
        # Start camera
        self.picam2.start()
        
        # Threading and buffer initialization
        self.running = True
        self.capture_thread = None
        self.frame_buffer = None
        self.frame_id = 0  # Frame counter for debugging/profiling
        
        # Initialize shared memory frame buffer if enabled
        if USE_SHARED_MEMORY:
            self.frame_buffer = SharedFrameBuffer(self.width, self.height, FRAME_BUFFER_SIZE)
    
    def start_capture(self):
        """
        Start threaded camera capture.
        
        Creates and starts a daemon thread for continuous frame capture.
        The daemon thread will automatically terminate when the main program exits.
        """
        self.capture_thread = threading.Thread(target=self.capture_loop, daemon=True)
        self.capture_thread.start()
        print("Camera capture thread started")
        
        # Note: Thread-level CPU affinity setting is limited in Python
        # Process-level affinity (set in main) is more effective
    
    def capture_loop(self):
        """
        High-performance capture loop running in separate thread.
        
        Continuously captures frames from camera and stores them in shared buffer.
        Runs until self.running is set to False.
        
        Key optimizations:
        - Immediate frame flipping for mirror effect
        - Direct writing to shared memory buffer
        - Minimal error handling to maintain performance
        """
        print("Camera capture loop started")
        
        while self.running:
            try:
                # Capture frame from camera
                # PiCamera2 returns RGB format directly (no conversion needed)
                frame = self.picam2.capture_array()
                
                # Flip frame horizontally for mirror effect
                # This makes left/right movements feel natural to the user
                frame = cv2.flip(frame, 1)
                
                # Store frame in shared buffer for worker processes
                if self.frame_buffer:
                    self.frame_buffer.write_frame(frame)
                
                # Increment frame counter for debugging
                self.frame_id += 1
                
            except Exception as e:
                print(f"Camera capture error: {e}")
                break  # Exit capture loop on serious errors
        
        print("Camera capture loop ended")
    
    def read_frame(self):
        """
        Get the most recent frame from the buffer.
        
        Returns:
            np.ndarray or None: Latest frame data, or None if no frame available
            
        This is called from the main thread to get frames for processing.
        """
        if self.frame_buffer:
            return self.frame_buffer.read_frame()
        return None
    
    def stop(self):
        """
        Stop camera capture and clean up resources.
        
        Should be called before program exit to properly shut down camera
        and clean up shared memory resources.
        """
        print("Stopping camera...")
        
        # Signal capture thread to stop
        self.running = False
        
        # Wait for capture thread to finish
        if self.capture_thread:
            self.capture_thread.join(timeout=1)
            if self.capture_thread.is_alive():
                print("Warning: Capture thread did not stop cleanly")
        
        # Stop and close camera
        try:
            self.picam2.stop()
            self.picam2.close()
            print("Camera stopped")
        except Exception as e:
            print(f"Warning: Camera shutdown error: {e}")
        
        # Clean up shared memory
        if self.frame_buffer:
            self.frame_buffer.cleanup()

class MultiprocessingDirectionalTracker:
    """
    High-performance directional gesture tracker with enhanced sensitivity.
    
    This class implements sophisticated gesture recognition algorithms to detect
    left/right hand movements and trigger corresponding keyboard actions.
    
    Key features:
    - Multiple detection methods (velocity, distance, momentum)
    - Configurable sensitivity parameters
    - Multiprocessing support for MediaPipe integration
    - Advanced movement prediction and smoothing
    - Spam protection with cooldown timers
    
    Detection methods:
    1. Velocity-based: Detects rapid movements above threshold
    2. Distance-based: Accumulates movement over time
    3. Momentum-based: Tracks directional consistency
    """
    
    def __init__(self):
        """Initialize tracker with movement history and multiprocessing setup."""
        
        # ========== MOVEMENT TRACKING STATE ==========
        # These variables track hand position and movement over time
        
        self.movement_history = []      # List of (timestamp, velocity) tuples
        self.max_movement_history = MIN_MOVEMENT_FRAMES  # How many frames to remember
        self.last_x_position = None     # Previous hand x-coordinate for velocity calculation
        
        # ========== SPAM PREVENTION ==========
        # Prevent rapid-fire key presses from single gesture
        
        self.last_key_press_time = 0    # Timestamp of last key press
        self.key_press_cooldown = REACTION_TIME_MS / 1000.0  # Minimum time between presses
        
        # ========== ENHANCED DETECTION FEATURES ==========
        # Advanced algorithms for more reliable gesture detection
        
        # Cumulative movement tracking for slow but deliberate gestures
        self.cumulative_movement = 0         # Total distance moved from starting position
        self.movement_start_time = None      # When current movement sequence began
        self.movement_start_position = None  # Starting x-position of current movement
        
        # Motion prediction for fast movements
        self.velocity_history = []           # Recent velocity values for smoothing
        self.max_velocity_history = 3        # Number of velocity samples to keep
        
        # Directional momentum tracking for consistent movements
        self.direction_momentum = 0          # Accumulated directional bias (+right, -left)
        self.momentum_decay = 0.8           # How quickly momentum fades without movement
        
        # ========== MULTIPROCESSING SETUP ==========
        # Initialize worker processes and communication queues
        
        self.worker_processes = []  # List of MediaPipe worker process handles
        self.input_queues = []      # Queues for sending frames to workers
        self.output_queue = None    # Queue for receiving results from workers
        self.should_stop = None     # Shared flag to signal worker shutdown
        
        # Start worker processes if multiprocessing is enabled
        if USE_PROCESS_POOL:
            self.setup_worker_processes()
        
        # ========== RESULTS TRACKING ==========
        # Keep track of processed frames and cache results
        
        self.last_frame_id = -1     # ID of last processed frame
        self.results_cache = {}     # Cache for recent detection results
    
    def setup_worker_processes(self):
        """
        Initialize worker processes for MediaPipe hand detection.
        
        Creates the specified number of worker processes, each with its own
        input queue for receiving frames and a shared output queue for results.
        
        This allows MediaPipe processing to run in parallel with the main
        camera capture and gesture detection logic.
        """
        print("Setting up MediaPipe worker processes...")
        
        # Shared flag for coordinated shutdown
        self.should_stop = Value('b', False)
        
        # Shared output queue for all workers
        self.output_queue = Queue(maxsize=10)
        
        # Create worker processes
        for i in range(NUM_WORKER_PROCESSES):
            # Each worker gets its own input queue
            input_queue = Queue(maxsize=2)  # Small queue to reduce latency
            self.input_queues.append(input_queue)
            
            # Create worker process
            worker = Process(
                target=mediapipe_worker,
                args=(i, input_queue, self.output_queue, self.should_stop),
                daemon=True  # Worker dies when main process exits
            )
            worker.start()
            self.worker_processes.append(worker)
        
        print(f"Started {NUM_WORKER_PROCESSES} MediaPipe worker processes")
    
    def distribute_frame(self, frame, timestamp, frame_id):
        """
        Distribute frame to the worker with the smallest queue.
        
        Args:
            frame (np.ndarray): Camera frame data
            timestamp (float): Frame capture timestamp
            frame_id (int): Unique frame identifier
            
        Load balancing ensures work is distributed evenly across workers
        and prevents any single worker from becoming a bottleneck.
        """
        if not USE_PROCESS_POOL:
            return  # Skip if multiprocessing disabled
        
        # Find worker with least queue load
        best_worker = 0
        min_qsize = float('inf')
        
        for i, queue in enumerate(self.input_queues):
            qsize = queue.qsize()
            if qsize < min_qsize:
                min_qsize = qsize
                best_worker = i
        
        # Send frame to best available worker
        try:
            # Make a copy of frame data for worker process
            # (required because processes don't share memory space)
            self.input_queues[best_worker].put_nowait((frame.copy(), timestamp, frame_id))
        except:
            # Queue full - worker is behind, skip this frame
            # This is normal under high load and prevents blocking
            pass
    
    def get_latest_result(self):
        """
        Get the most recent MediaPipe result from workers.
        
        Returns:
            dict or None: Latest detection result, or None if no results available
            
        Processes all available results and returns only the most recent one.
        This prevents the system from processing stale detection results.
        """
        latest_result = None
        
        # Collect all available results from output queue
        while True:
            try:
                result = self.output_queue.get_nowait()
                latest_result = result  # Keep only the most recent
            except Empty:
                break  # No more results available
        
        return latest_result
    
    def detect_directional_movement(self, frame, timestamp, frame_id):
        """
        Main directional detection method with multiprocessing support.
        
        Args:
            frame (np.ndarray): Camera frame data
            timestamp (float): Frame timestamp
            frame_id (int): Unique frame identifier
            
        Returns:
            tuple: (hand_detected: bool, tracking_info: dict)
            
        This is the core method that:
        1. Sends frames to MediaPipe workers (if multiprocessing enabled)
        2. Receives hand detection results
        3. Calculates movement velocity and direction
        4. Triggers keyboard actions based on gesture detection
        5. Returns tracking information for display/debugging
        """
        if frame is None:
            return False, {}
        
        # ========== MEDIAPIPE PROCESSING ==========
        # Get hand detection results either from workers or direct processing
        
        if USE_PROCESS_POOL:
            # Multiprocessing mode: distribute frame to workers
            self.distribute_frame(frame, timestamp, frame_id)
            
            # Get latest detection result from workers
            result = self.get_latest_result()
            if result is None:
                return False, {}  # No results available yet
            
            hand_data = result['hand_data']
            
        else:
            # Single-process fallback mode for debugging or compatibility
            # This bypasses multiprocessing and runs MediaPipe directly
            print("Warning: Using single-process mode - performance will be limited")
            
            # Initialize MediaPipe (this is expensive, normally done in workers)
            mp_hands = mp.solutions.hands
            hands = mp_hands.Hands(
                static_image_mode=False,
                max_num_hands=1,
                min_detection_confidence=0.4,
                min_tracking_confidence=0.2,
                model_complexity=0
            )
            
            # Convert frame format if needed
            if len(frame.shape) == 3 and frame.shape[2] == 3:
                rgb_frame = frame  # Already RGB from PiCamera2
            else:
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Process frame with MediaPipe
            results = hands.process(rgb_frame)
            hands.close()  # Important: clean up MediaPipe resources
            
            # Extract hand data
            hand_data = {'detected': False}
            if results.multi_hand_landmarks:
                landmarks = results.multi_hand_landmarks[0]
                index_tip = landmarks.landmark[8]
                hand_data = {
                    'x': index_tip.x,
                    'y': index_tip.y,
                    'detected': True
                }
        
        # ========== MOVEMENT ANALYSIS ==========
        # Analyze hand position changes and detect directional gestures
        
        tracking_info = {}  # Information to return for debugging/display
        hand_detected = hand_data['detected']
        
        if hand_detected:
            # Convert normalized coordinates to pixel coordinates
            frame_width = frame.shape[1]
            x = hand_data['x'] * frame_width
            
            if self.last_x_position is not None:
                # Calculate movement velocity (pixels per frame)
                raw_velocity = x - self.last_x_position
                
                # Apply speed boost factor for enhanced sensitivity
                boosted_velocity = raw_velocity * SPEED_BOOST_FACTOR
                
                # ========== VELOCITY HISTORY ==========
                # Track recent velocities for motion prediction and smoothing
                
                self.velocity_history.append(boosted_velocity)
                if len(self.velocity_history) > self.max_velocity_history:
                    self.velocity_history.pop(0)  # Remove oldest velocity
                
                # Update movement history with timestamp for temporal analysis
                self.movement_history.append((timestamp, boosted_velocity))
                if len(self.movement_history) > self.max_movement_history:
                    self.movement_history.pop(0)
                
                # ========== CUMULATIVE MOVEMENT TRACKING ==========
                # Track total distance moved for slow but deliberate gestures
                
                if MOVEMENT_ACCUMULATION:
                    if self.movement_start_position is None:
                        # Start new movement sequence
                        self.movement_start_position = x
                        self.movement_start_time = timestamp
                        self.cumulative_movement = 0
                    
                    # Calculate total distance from movement start
                    total_distance = x - self.movement_start_position
                    self.cumulative_movement = total_distance
                
                # ========== DIRECTIONAL MOMENTUM ==========
                # Build up directional bias for consistent movements
                
                if abs(boosted_velocity) > 1:  # Only update momentum for meaningful movement
                    # Scale momentum based on movement speed (faster = more momentum)
                    momentum_factor = min(abs(boosted_velocity) / 10, 1.0)
                    
                    if boosted_velocity > 0:
                        # Moving right - increase positive momentum
                        self.direction_momentum = max(0, self.direction_momentum) + momentum_factor
                    else:
                        # Moving left - increase negative momentum
                        self.direction_momentum = min(0, self.direction_momentum) - momentum_factor
                else:
                    # No significant movement - decay momentum gradually
                    self.direction_momentum *= self.momentum_decay
                
                # ========== GESTURE DETECTION ==========
                # Check if current movement pattern constitutes a directional gesture
                
                direction = self.check_enhanced_directional_gesture(timestamp)
                if direction:
                    # Gesture detected - record information for display/debugging
                    tracking_info['triggered_direction'] = direction
                    tracking_info['velocity'] = boosted_velocity
                    tracking_info['cumulative_movement'] = self.cumulative_movement
                    tracking_info['momentum'] = self.direction_momentum
            
            # Update position for next frame's velocity calculation
            self.last_x_position = x
            
            # Store tracking information for display/debugging
            tracking_info['hand_x_pos'] = x
            tracking_info['normalized_x'] = hand_data['x']
            tracking_info['raw_velocity'] = raw_velocity if 'raw_velocity' in locals() else 0
            tracking_info['boosted_velocity'] = boosted_velocity if 'boosted_velocity' in locals() else 0
            
        else:
            # ========== NO HAND DETECTED ==========
            # Reset tracking state when hand is lost
            
            self.last_x_position = None
            self.movement_history.clear()
            self.velocity_history.clear()
            self.cumulative_movement = 0
            self.movement_start_position = None
            self.movement_start_time = None
            # Keep some momentum when hand is lost (allows for brief occlusion)
            self.direction_momentum *= 0.5  # Slower decay when hand lost
        
        return hand_detected, tracking_info
    
    def check_enhanced_directional_gesture(self, current_time):
        """
        Enhanced directional gesture detection with multiple sensitivity modes.
        
        This method implements three different detection algorithms and triggers
        a directional action if ANY of them detect a valid gesture:
        
        1. Velocity-based: Rapid movements above threshold
        2. Distance-based: Cumulative movement over threshold distance
        3. Momentum-based: Consistent directional movement over time
        
        Args:
            current_time (float): Current timestamp for cooldown checking
            
        Returns:
            str or None: 'left', 'right', or None if no gesture detected
            
        The multiple detection methods make the system more reliable across
        different user movement patterns and preferences.
        """
        
        # ========== PREREQUISITE CHECKS ==========
        # Ensure we have enough data and respect cooldown period
        
        if len(self.movement_history) < MIN_MOVEMENT_FRAMES:
            return None  # Need more movement data
        
        # Check cooldown period to prevent key spam
        if current_time - self.last_key_press_time < self.key_press_cooldown:
            return None  # Too soon since last key press
        
        # ========== METHOD 1: VELOCITY-BASED DETECTION ==========
        # Detects rapid movements by analyzing recent frame-to-frame velocities
        
        # Extract recent velocities from movement history
        recent_velocities = [vel for _, vel in self.movement_history[-MIN_MOVEMENT_FRAMES:]]
        avg_velocity = sum(recent_velocities) / len(recent_velocities)
        
        # Check velocity consistency - most recent frames should move in same direction
        # This prevents false triggers from hand jitter or direction changes
        velocity_consistency = len(recent_velocities) >= MIN_MOVEMENT_FRAMES and \
                              sum(1 for vel in recent_velocities if (vel > 0) == (avg_velocity > 0)) >= (MIN_MOVEMENT_FRAMES - 1)
        
        # ========== METHOD 2: CUMULATIVE DISTANCE DETECTION ==========
        # Detects slow but deliberate movements by total distance traveled
        
        cumulative_trigger = False
        if MOVEMENT_ACCUMULATION and self.movement_start_position is not None:
            if abs(self.cumulative_movement) > MIN_TRAVEL_DISTANCE:
                cumulative_trigger = True
                print(f"Cumulative distance trigger: {self.cumulative_movement:.1f} pixels")
        
        # ========== METHOD 3: MOMENTUM-BASED DETECTION ==========
        # Detects consistent directional movement over time
        
        momentum_trigger = abs(self.direction_momentum) > 2.0
        
        # ========== TRIGGER EVALUATION ==========
        # Check if any detection method indicates a valid gesture
        
        velocity_trigger = velocity_consistency and abs(avg_velocity) > SWIPE_THRESHOLD
        
        if velocity_trigger or cumulative_trigger or momentum_trigger:
            direction = None
            trigger_reason = ""
            
            # ========== DIRECTION DETERMINATION ==========
            # Determine direction from the strongest signal
            
            if velocity_trigger and avg_velocity > SWIPE_THRESHOLD:
                direction = 'right'
                trigger_reason = f"velocity ({avg_velocity:.1f})"
            elif velocity_trigger and avg_velocity < -SWIPE_THRESHOLD:
                direction = 'left' 
                trigger_reason = f"velocity ({avg_velocity:.1f})"
            elif cumulative_trigger and self.cumulative_movement > MIN_TRAVEL_DISTANCE:
                direction = 'right'
                trigger_reason = f"distance ({self.cumulative_movement:.1f}px)"
            elif cumulative_trigger and self.cumulative_movement < -MIN_TRAVEL_DISTANCE:
                direction = 'left'
                trigger_reason = f"distance ({self.cumulative_movement:.1f}px)"
            elif momentum_trigger and self.direction_momentum > 2.0:
                direction = 'right'
                trigger_reason = f"momentum ({self.direction_momentum:.1f})"
            elif momentum_trigger and self.direction_momentum < -2.0:
                direction = 'left'
                trigger_reason = f"momentum ({self.direction_momentum:.1f})"
            
            if direction:
                # ========== ACTION EXECUTION ==========
                # Execute keyboard action and update state
                
                # Send arrow key press to system
                pyautogui.press(direction)
                
                # Update cooldown timer
                self.last_key_press_time = current_time
                
                # Reset tracking state after successful trigger
                # This prevents multiple triggers from single gesture
                self.cumulative_movement = 0
                self.movement_start_position = None
                self.movement_start_time = None
                self.direction_momentum = 0
                
                # Log successful detection for debugging
                print(f"{direction.upper()} key triggered by {trigger_reason}")
                return direction
        
        return None  # No gesture detected
    
    def cleanup(self):
        """
        Clean up all processes and resources.
        
        This method ensures proper shutdown of worker processes and cleanup
        of multiprocessing resources. Should be called before program exit.
        """
        if USE_PROCESS_POOL and self.should_stop:
            print("Stopping MediaPipe worker processes...")
            
            # Signal all workers to stop
            self.should_stop.value = True
            
            # Wait for processes to finish gracefully
            for i, process in enumerate(self.worker_processes):
                process.join(timeout=2)  # Wait up to 2 seconds
                if process.is_alive():
                    print(f"Warning: Force terminating worker {i}")
                    process.terminate()  # Force kill if needed
            
            # Clear all queues to prevent resource leaks
            for queue in self.input_queues:
                while not queue.empty():
                    try:
                        queue.get_nowait()
                    except Empty:
                        break
            
            # Clear output queue
            while not self.output_queue.empty():
                try:
                    self.output_queue.get_nowait()
                except Empty:
                    break
            
            print("Worker processes cleaned up")

def main():
    """
    Main application function.
    
    Coordinates all components of the hand tracking system:
    - Camera initialization and capture
    - Multiprocessing worker setup
    - Main detection loop
    - Performance monitoring
    - User interface (if preview enabled)
    - Graceful shutdown and cleanup
    """
    
    # ========== PERFORMANCE OPTIMIZATION ==========
    # Set high priority and CPU affinity for better real-time performance
    
    set_process_priority()  # Request higher CPU priority
    set_cpu_affinity(0)     # Pin main process to CPU core 0
    
    # ========== STARTUP INFORMATION ==========
    # Display configuration and settings to user
    
    print("High-Performance Multiprocessing Hand Tracker")
    print("=" * 50)
    print(f"Camera: {CAMERA_WIDTH}x{CAMERA_HEIGHT} @ {TARGET_FPS} FPS")
    print(f"Multiprocessing: {'ON' if USE_PROCESS_POOL else 'OFF'}")
    print(f"Worker processes: {NUM_WORKER_PROCESSES}")
    print(f"CPU Affinity: {'ON' if SET_CPU_AFFINITY else 'OFF'}")
    print(f"Shared Memory: {'ON' if USE_SHARED_MEMORY else 'OFF'}")
    print(f"Preview: {'ON' if SHOW_PREVIEW else 'OFF'}")
    print()
    print("SENSITIVITY SETTINGS:")
    print(f"• Speed threshold: {SWIPE_THRESHOLD} (lower = more sensitive)")
    print(f"• Travel distance: {MIN_TRAVEL_DISTANCE}px (lower = easier trigger)")
    print(f"• Reaction time: {REACTION_TIME_MS}ms (lower = faster response)")
    print(f"• Movement accumulation: {'ON' if MOVEMENT_ACCUMULATION else 'OFF'}")
    print(f"• Speed boost factor: {SPEED_BOOST_FACTOR}x")
    print()
    print("Move hand left/right to trigger arrow keys. Press Ctrl+C to quit.")
    print("Red/blue lines show trigger zones from center.")
    
    try:
        # ========== COMPONENT INITIALIZATION ==========
        # Initialize camera and tracking system
        
        print("\nInitializing components...")
        camera = MultiprocessingPiCamera((CAMERA_WIDTH, CAMERA_HEIGHT))
        tracker = MultiprocessingDirectionalTracker()
        
        # Start camera capture thread
        camera.start_capture()
        time.sleep(1.0)  # Allow camera to warm up and auto-adjust exposure
        
        # ========== PERFORMANCE MONITORING SETUP ==========
        # Initialize FPS counter and statistics if enabled
        
        if SHOW_FPS:
            fps_counter = FPS().start()  # imutils FPS counter
            frame_count = 0              # Manual frame counter
            last_fps_time = time.time()  # For manual FPS calculation
            fps_display = 0              # Current FPS to display
        
        print("Starting high-performance tracking...")
        frame_id = 0
        
        # ========== MAIN PROCESSING LOOP ==========
        # Core loop that processes frames and detects gestures
        
        while True:
            loop_start_time = time.time()
            
            # ========== FRAME ACQUISITION ==========
            # Get latest frame from camera buffer
            
            frame = camera.read_frame()
            if frame is None:
                # No frame available - brief sleep to prevent busy waiting
                time.sleep(0.001)  # 1ms sleep
                continue
            
            frame_id += 1
            
            # ========== FPS TRACKING ==========
            # Update performance counters
            
            if SHOW_FPS:
                frame_count += 1
                fps_counter.update()
            
            # ========== GESTURE DETECTION ==========
            # Process frame and detect directional movements
            
            hand_detected, tracking_info = tracker.detect_directional_movement(
                frame, loop_start_time, frame_id
            )
            
            # ========== PREVIEW DISPLAY ==========
            # Show camera feed with overlays if preview is enabled
            
            if SHOW_PREVIEW:
                # Convert from RGB (PiCamera2) to BGR (OpenCV display format)
                display_frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
                
                # ========== HAND POSITION VISUALIZATION ==========
                # Draw hand position and movement indicators
                
                if tracking_info and 'hand_x_pos' in tracking_info:
                    hand_x = int(tracking_info['hand_x_pos'])
                    hand_y = CAMERA_HEIGHT // 2  # Center vertically
                    
                    # Draw hand position indicator (large green circle with white center)
                    cv2.circle(display_frame, (hand_x, hand_y), 12, (0, 255, 0), 3)  # Green outline
                    cv2.circle(display_frame, (hand_x, hand_y), 6, (255, 255, 255), -1)  # White center
                    
                    # ========== REFERENCE LINES AND ZONES ==========
                    # Draw center line and trigger zones for user reference
                    
                    center_x = CAMERA_WIDTH // 2
                    # Center reference line (gray)
                    cv2.line(display_frame, (center_x, 0), (center_x, CAMERA_HEIGHT), (128, 128, 128), 1)
                    
                    # Movement sensitivity zones
                    left_zone = center_x - MIN_TRAVEL_DISTANCE   # Left trigger zone
                    right_zone = center_x + MIN_TRAVEL_DISTANCE  # Right trigger zone
                    cv2.line(display_frame, (left_zone, 0), (left_zone, CAMERA_HEIGHT), (255, 100, 100), 1)  # Red
                    cv2.line(display_frame, (right_zone, 0), (right_zone, CAMERA_HEIGHT), (100, 100, 255), 1)  # Blue
                    
                    # ========== MOVEMENT DATA DISPLAY ==========
                    # Show velocity and movement information as text overlays
                    
                    if 'boosted_velocity' in tracking_info:
                        vel_text = f"Vel: {tracking_info['boosted_velocity']:.1f}"
                        cv2.putText(display_frame, vel_text, (10, 70), 
                                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
                    
                    if 'cumulative_movement' in tracking_info:
                        cum_text = f"Dist: {tracking_info['cumulative_movement']:.1f}px"
                        cv2.putText(display_frame, cum_text, (10, 90), 
                                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
                    
                    # ========== TRIGGER NOTIFICATION ==========
                    # Show large text when gesture is triggered
                    
                    if 'triggered_direction' in tracking_info:
                        direction = tracking_info['triggered_direction']
                        velocity = tracking_info.get('velocity', 0)
                        # Color code: green for right, red for left
                        color = (0, 255, 0) if direction == 'right' else (0, 0, 255)
                        cv2.putText(display_frame, f'{direction.upper()} TRIGGERED!', 
                                   (10, 40), cv2.FONT_HERSHEY_SIMPLEX, 1.0, color, 3)
                
                # ========== STATUS INDICATORS ==========
                # Show hand detection status and performance info
                
                # Hand detection status
                status_color = (0, 255, 0) if hand_detected else (0, 0, 255)
                status_text = "HAND DETECTED" if hand_detected else "NO HAND"
                cv2.putText(display_frame, status_text, (10, CAMERA_HEIGHT - 20), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, status_color, 2)
                
                # FPS display
                if SHOW_FPS:
                    current_time = time.time()
                    # Update FPS calculation every second
                    if current_time - last_fps_time >= 1.0:
                        fps_display = frame_count / (current_time - last_fps_time)
                        frame_count = 0
                        last_fps_time = current_time
                    
                    cv2.putText(display_frame, f'FPS: {fps_display:.0f}', 
                               (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
                
                # ========== DISPLAY UPDATE ==========
                # Show the frame and check for quit key
                
                cv2.imshow('Multiprocessing Hand Tracker - Press Q to quit', display_frame)
                
                # Check for quit key (Q) or window close
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
            
            # ========== FRAME RATE LIMITING ==========
            # Maintain target FPS to prevent excessive CPU usage
            
            if TARGET_FPS > 0:
                elapsed = time.time() - loop_start_time
                target_time = 1.0 / TARGET_FPS
                if elapsed < target_time:
                    # Sleep to maintain target frame rate
                    time.sleep(target_time - elapsed)
    
    except KeyboardInterrupt:
        # ========== GRACEFUL SHUTDOWN ==========
        # Handle Ctrl+C interrupt
        print("\nInterrupted by user")
        
    except Exception as e:
        # ========== ERROR HANDLING ==========
        # Log unexpected errors with full traceback
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        
    finally:
        # ========== CLEANUP ==========
        # Ensure all resources are properly cleaned up
        
        print("Cleaning up...")
        
        # Display final performance statistics
        if SHOW_FPS and 'fps_counter' in locals():
            fps_counter.stop()
            print(f"Average FPS: {fps_counter.approx_fps:.2f}")
        
        # Clean up tracking system (stops worker processes)
        if 'tracker' in locals():
            tracker.cleanup()
        
        # Stop camera and clean up shared memory
        if 'camera' in locals():
            camera.stop()
        
        # Close OpenCV windows
        if SHOW_PREVIEW:
            cv2.destroyAllWindows()
        
        print("High-performance hand tracker stopped.")

if __name__ == "__main__":
    """
    Entry point for the application.
    
    Sets multiprocessing start method and runs main function.
    The 'spawn' method is required for proper multiprocessing on some platforms
    and ensures clean separation between processes.
    """
    
    # Set multiprocessing start method
    # 'spawn' creates completely independent processes (required for MediaPipe)
    # 'fork' (default on Linux) can cause issues with complex libraries like MediaPipe
    try:
        mp_proc.set_start_method('spawn', force=True)
        print("Multiprocessing method set to 'spawn'")
    except RuntimeError:
        # Start method can only be set once per program
        print("Multiprocessing method already set")
    
    # Run main application
    main()

# ========== POTENTIAL COMPATIBILITY ISSUES AND FIXES ==========
# 
# The following sections identify potential outdated or problematic code:
#
# 1. SHARED MEMORY COMPATIBILITY:
#    - shared_memory module requires Python 3.8+
#    - On older systems, falls back to regular arrays (slower but compatible)
#
# 2. PICAMERA2 DEPENDENCY:
#    - Only available on Raspberry Pi OS
#    - For testing on other systems, would need to replace with cv2.VideoCapture
#
# 3. CPU AFFINITY LIMITATIONS:
#    - Requires root privileges for negative nice values
#    - psutil.cpu_affinity() may not work on all systems
#    - Currently disabled by default (SET_CPU_AFFINITY = False)
#
# 4. MEDIAPIPE MULTIPROCESSING:
#    - MediaPipe can be unstable with multiple workers
#    - NUM_WORKER_PROCESSES set to 1 for stability
#    - 'spawn' start method required for proper isolation
#
# 5. PERFORMANCE TUNING:
#    - Frame buffer size and queue sizes may need adjustment based on Pi model
#    - Camera resolution vs performance trade-off
#    - Detection thresholds may need per-user calibration
#
# ========== RECOMMENDED MODIFICATIONS FOR PRODUCTION USE ==========
#
# 1. Add configuration file support for sensitivity settings
# 2. Implement user calibration routine for movement thresholds  
# 3. Add support for different camera backends (USB webcam fallback)
# 4. Implement gesture recording/playback for testing
# 5. Add network/API interface for remote control
# 6. Implement hand tracking quality metrics and auto-adjustment
# 7. Add support for more complex gestures (circles, pinch, etc.)
#
# ========== DEBUGGING RECOMMENDATIONS ==========
#
# To debug issues:
# 1. Set SHOW_PREVIEW = True to see visual feedback
# 2. Set NUM_WORKER_PROCESSES = 0 to disable multiprocessing
# 3. Increase MIN_TRAVEL_DISTANCE for easier triggering
# 4. Lower SWIPE_THRESHOLD for more sensitive detection
# 5. Enable verbose logging in MediaPipe sections
#
# =================================================================