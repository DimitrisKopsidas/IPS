DELIMITER //

CREATE PROCEDURE GetFilteredProducts(
    IN input_type VARCHAR(100),
    IN input_maker VARCHAR(100)
)
BEGIN
    SELECT 
        PRODUCT AS ID,
        P.CODE,
        P.NAME,
        T.NAME AS TYPE,
        M.NAME AS MAKER,
        PRICE,
        DISCOUNT,
        FINALPRICE,
        NOTES 
    FROM 
        PRODUCT P
    INNER JOIN 
        MAKER M ON M.MAKER = P.MAKER
    INNER JOIN 
        TYPE T ON T.TYPE = P.TYPE
    WHERE 
        (input_type IS NULL OR T.NAME = input_type)
        AND (input_maker IS NULL OR M.NAME = input_maker);
END //

DELIMITER ;
