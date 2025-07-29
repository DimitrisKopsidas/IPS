DELIMITER //

CREATE PROCEDURE GetMinigameSettingsCarousel (IN p_carousel INT)
BEGIN
	SELECT 
        m.revolutions,
        m.spinduration,
        m.onstoptime,
        m.inactivitytime
    FROM 
		minigame m
    WHERE 
		m.minigame = p_carousel;
END //

DELIMITER ;
