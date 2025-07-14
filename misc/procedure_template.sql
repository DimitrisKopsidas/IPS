DELIMITER $$

CREATE PROCEDURE GetCarouselsByDeviceFilter(IN filterDeviceNotNull BOOLEAN)
BEGIN
    SELECT 
        C.CAROUSEL AS ID,
        C.CODE,
        C.NAME,
        C.DEVICE,
        C.NOTES,
        C.AUTOPLAYWAIT,
        C.SPEED,
        C.GAMECOUNT,
        C.STATE,
        M.REVOLUTIONS,
        M.SPINDURATION,
        M.ONSTOPTIME,
        M.INACTIVITYTIME
    FROM 
        CAROUSEL C
    INNER JOIN
        MINIGAME M ON C.CAROUSEL = M.CAROUSEL
    WHERE 
        (filterDeviceNotNull IS NULL OR (C.DEVICE IS NOT NULL AND C.DEVICE != 0));
END$$

DELIMITER ;
