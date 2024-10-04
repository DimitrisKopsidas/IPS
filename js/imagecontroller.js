//CONTROLS THE IMAGES IN THE CAROUSEL DONT TOUCH!!!!!!!!!!!!!!!!!!!


//CSS
var imgcss= "width:100vw; height:100vh; display: block; margin: auto;"

window.onload = function() {
    // Get the path of the current directory
    var currentPath = "media/";

    // Fetch images from the directory
    fetch(currentPath)
        .then(response => response.text())
        .then(data => {
            // Extract image filenames from the HTML response
            var imageFilenames = getImageFilenames(data);

            // Count the number of images
            var imageCount = countImages(imageFilenames);

            // Output the image count
            console.log("Images found in folder:", imageCount);

            // Store the image count in a variable
            var imageCountVariable = imageCount;
            console.log("Image variable:", imageCountVariable);

            createItems(imageCount);
            
            setInterval(createItems, 500);
        })
        .catch(error => console.error('Error fetching images:', error));




    function createItems(imageCount){
        carouselDiv = document.getElementById("thecarousel");
            for(let i = 2; i <= imageCount; i++){
                //create divs for images
                var item = document.createElement("div");
                var img = document.createElement("img");
                item.className = "item";
                img.src = "media/"+i+".png";
                img.style = imgcss;//temp fix for broken external css
                carouselDiv.appendChild(item);
                item.appendChild(img);
            }
    }    

    // Function to extract image filenames from the HTML response
    function getImageFilenames(htmlContent) {
        var regex = /<a href="?\'?([^"\'>]*)/g;
        var matches;
        var imageFilenames = [];
        while (matches = regex.exec(htmlContent)) {
            var filename = matches[1];
            if (filename.endsWith("/") === false) {
                imageFilenames.push(filename);
            }
        }
        return imageFilenames;
    }

    // Function to count the number of images
    function countImages(imageFilenames) {
        var imageExtensions = ["jpg", "jpeg", "png", "gif"];
        var count = 0;
        imageFilenames.forEach(function(filename) {
            var extension = filename.split('.').pop().toLowerCase();
            if (imageExtensions.includes(extension)) {
                count++;
            }
        });
        return count;
    }
}