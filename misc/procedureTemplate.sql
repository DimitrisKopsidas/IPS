DELIMITER $$

CREATE PROCEDURE GetFilteredPromos(IN input_type VARCHAR(100),
    IN input_maker VARCHAR(100))
BEGIN
SELECT 
        P.PRODUCT AS PRODUCTID,
        P.CODE AS PRODUCTCODE,
        P.NAME AS PRODUCTNAME,
        T.NAME AS TYPENAME,
        M.NAME AS MAKERNAME,
        P.PRICE,
        PRO.PROMO AS PROMOID,
        PRO.CODE AS PROMOCODE,
        PRO.DISCOUNT as PROMODISCOUNT
    FROM 
        PROMO PRO
    LEFT JOIN 
        MAKER M ON M.MAKER = P.MAKER
    LEFT JOIN 
        TYPE T ON T.TYPE = P.TYPE
	INNER JOIN
		PRODUCT P ON PRO.PRODUCT = P.PRODUCT
    WHERE 
        (input_type IS NULL OR T.NAME = input_type)
        AND (input_maker IS NULL OR M.NAME = input_maker)
        group by p.code;
END$$

DELIMITER ;
