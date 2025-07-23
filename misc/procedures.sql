DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `DeleteCarouselAndMinigame`(
    IN p_carousel_id INT
)
BEGIN
    -- Delete the associated MINIGAME first (due to foreign key constraint)
    DELETE FROM MINIGAME
    WHERE CAROUSEL = p_carousel_id;

    -- Then delete the CAROUSEL
    DELETE FROM CAROUSEL
    WHERE CAROUSEL = p_carousel_id;
    
    DELETE FROM PROMOLINES
    WHERE MINIGAME = p_carousel_id;
    
    DELETE FROM PRODUCTLINES
    WHERE CAROUSEL = p_carousel_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `DeleteMaker`(
    IN p_maker_id INT
)
BEGIN
    DELETE FROM MAKER
    WHERE MAKER = p_maker_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `DeleteProduct`(
    IN p_product_id INT
)
BEGIN
    DELETE FROM PRODUCT
    WHERE PRODUCT = p_product_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `DeleteProductlines`(
    IN P_PRODUCTLINES INT
)
BEGIN
    DELETE FROM PRODUCTLINES
    WHERE PRODUCTLINES = P_PRODUCTLINES;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `DeletePromo`(IN p_promo_id INT)
BEGIN
    DELETE FROM PROMO
    WHERE PROMO = p_promo_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `DeletePromoLines`(
    IN p_PROMOLINES INT
)
BEGIN
    DELETE FROM PROMOLINES
    WHERE PROMOLINES = p_PROMOLINES;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `DeleteType`(
    IN p_type_id INT
)
BEGIN
    DELETE FROM TYPE
    WHERE TYPE = p_type_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetAllDevices`()
BEGIN
    SELECT 
		D.* 
	FROM 
		DEVICE D
	LEFT JOIN 
		CAROUSEL C ON D.DEVICE = C.DEVICE
	WHERE C.DEVICE IS NULL; 
	
	END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetAssociatedCarouselForPromo`(
    IN p_promo INT
)
BEGIN
    SELECT
	C.CAROUSEL AS CAROUSELID,
    C.CODE AS CAROUSELCODE,
    C.NAME AS CAROUSELNAME,
    CHANCE
	FROM 
		PROMO PRO
	INNER JOIN
		PROMOLINES PRL ON PRL.PROMO = PRO.PROMO
	INNER JOIN
		MINIGAME M ON M.MINIGAME = PRL.MINIGAME
	INNER JOIN 
		CAROUSEL C ON M.CAROUSEL = M.MINIGAME
	WHERE 
		PRO.PROMO = p_promo;
	END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetCarouselMinigame`(IN p_carousel BOOLEAN)
BEGIN
    SELECT 
		MINIGAME AS ID,
        REVOLUTIONS,
        SPINDURATION,
        ONSTOPTIME,
        INACTIVITYTIME
    FROM 
        MINIGAME
    WHERE 
        CAROUSEL = p_carousel;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetCarouselProducts`(IN p_carousel BOOLEAN)
BEGIN
    SELECT 
        QUEUE,
        P.PRODUCT AS ID,
        P.CODE,
        P.NAME,
        T.CODE AS TYPECODE,
        M.CODE AS MAKERCODE,
        T.NAME AS TYPENAME,
        M.NAME AS MAKERNAME,
        PRICE,
        DISCOUNT,
        FINALPRICE
    FROM 
        PRODUCTLINES PR
	INNER JOIN
		PRODUCT P ON PR.PRODUCT = P.PRODUCT
	INNER JOIN 
		MAKER M ON M.MAKER = P.MAKER
	INNER JOIN 
		TYPE T ON T.TYPE = P.TYPE
    WHERE 
        CAROUSEL = p_carousel;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetCarouselProductsConnect`(IN p_connectkey VARCHAR(255))
BEGIN
    SELECT 
        PL.PRODUCT, 
        PL.QUEUE,
        PR.NAME,
        PR.PRICE,
        PR.DISCOUNT,
        PR.FINALPRICE
    FROM 
        PRODUCTLINES PL
        INNER JOIN PRODUCT PR ON PL.PRODUCT = PR.PRODUCT
        INNER JOIN CAROUSEL C ON C.CAROUSEL = PL.CAROUSEL
        INNER JOIN DEVICE D ON D.DEVICE = C.DEVICE
    WHERE 
        D.CONNECTKEY = p_connectkey
    ORDER BY 
        PL.QUEUE;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetCarouselSettingsConnect`(IN p_connectkey VARCHAR(255))
BEGIN
    SELECT AUTOPLAYWAIT,SPEED,GAMECOUNT,STATE
    FROM CAROUSEL C
    INNER JOIN DEVICE D ON D.DEVICE = C.DEVICE
    WHERE D.CONNECTKEY = p_connectkey;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetFilteredCarousels`(IN filterParam BOOLEAN)
BEGIN
    SELECT 
        C.CAROUSEL AS ID,
        C.CODE,
        C.NAME,
        C.DEVICE,
        AUTOPLAYWAIT,
        SPEED,
        GAMECOUNT,
        STATE,
        REVOLUTIONS,
        SPINDURATION,
        ONSTOPTIME,
        INACTIVITYTIME,
        D.CODE AS DEVICECODE,
        D.NAME AS DEVICENAME,
        D.CONNECTKEY AS DEVICECONNECTKEY
    FROM 
        CAROUSEL C
	INNER JOIN 
		MINIGAME M ON M.CAROUSEL = C.CAROUSEL
	LEFT JOIN 
		DEVICE D ON D.DEVICE = C.DEVICE
    WHERE 
        (filterParam = TRUE OR (C.DEVICE IS NOT NULL AND C.DEVICE != 0));
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetFilteredProducts`(
    IN input_type VARCHAR(100),
    IN input_maker VARCHAR(100)
)
BEGIN
    SELECT 
        P.PRODUCT AS ID,
        P.CODE,
        P.NAME,
        T.TYPE AS TYPEID,
        M.MAKER AS MAKERID,
        T.CODE AS TYPECODE,
        M.CODE AS MAKERCODE,
        T.NAME AS TYPENAME,
        M.NAME AS MAKERNAME,
        P.PRICE,
        P.DISCOUNT,
        P.FINALPRICE,
        P.NOTES,
        C.CAROUSEL AS CAROUSELID,
        C.CODE AS CAROUSELCODE,
        C.NAME AS CAROUSELNAME,
        PRO.PROMO AS PROMOID,
        PRO.CODE AS PROMOCODE,
        PRO.DISCOUNT as PROMODISCOUNT
    FROM 
        PRODUCT P
    LEFT JOIN 
        MAKER M ON M.MAKER = P.MAKER
    LEFT JOIN 
        TYPE T ON T.TYPE = P.TYPE
	LEFT JOIN
		PRODUCTLINES PR ON PR.PRODUCT = P.PRODUCT
	LEFT JOIN 
		CAROUSEL C ON C.CAROUSEL = PR.CAROUSEL
	LEFT JOIN
		PROMO PRO ON PRO.PRODUCT = P.PRODUCT
    WHERE 
        (input_type IS NULL OR T.NAME = input_type)
        AND (input_maker IS NULL OR M.NAME = input_maker)
        group by p.code;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetFilteredPromos`(IN input_type VARCHAR(100),
    IN input_maker VARCHAR(100))
BEGIN
SELECT 
        P.PRODUCT AS PRODUCTID,
        P.CODE AS PRODUCTCODE,
        P.NAME AS PRODUCTNAME,
        T.NAME AS TYPENAME,
        M.NAME AS MAKERNAME,
        P.PRICE,
        PRO.PROMO AS ID,
        PRO.CODE AS CODE,
        PRO.DISCOUNT as DISCOUNT,
        DAYSTOLIVE,
        PRO.NOTES
    FROM 
        PROMO PRO
	INNER JOIN
		PRODUCT P ON PRO.PRODUCT = P.PRODUCT
    LEFT JOIN 
        MAKER M ON M.MAKER = P.MAKER
    LEFT JOIN 
        TYPE T ON T.TYPE = P.TYPE
    WHERE 
        (input_type IS NULL OR T.NAME = input_type)
        AND (input_maker IS NULL OR M.NAME = input_maker)
        group by CODE;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetIndexDeviceInfo`(IN p_device VARCHAR(255))
BEGIN
    SELECT 
        D.DEVICE AS ID,
        NAME,
        LASTPING
    FROM 
        DEVICE D
    INNER JOIN
        ISSUEDPROMO I ON I.DEVICE = D.DEVICE
    WHERE (p_device IS NULL OR I.DEVICE = p_device);
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetIndexPromoInfo`()
BEGIN
select 
	issuedpromo,
	issuedate,
    redeemdate,
	price as productprice,
    p.name as productname
from 
	issuedpromo i
inner join 
	promo pro on pro.promo = i.promo
inner join
	product p on p.product = pro.product;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetIssuedCount`(
    IN p_promo INT
)
BEGIN
    SELECT
		count(*) AS TOTALISSUED
	FROM 
		PROMO PRO
	INNER JOIN
		ISSUEDPROMO I ON I.PROMO = PRO.PROMO
	WHERE 
		PRO.PROMO = p_promo;
	END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetMakers`()
BEGIN
SELECT MAKER AS ID, CODE, NAME FROM MAKER;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetMinigamePromos`(IN p_carousel BOOLEAN)
BEGIN
    SELECT 
	CHANCE,
    PRO.CODE AS PROMOCODE,
    PRO.DISCOUNT,
    PRO.DAYSTOLIVE,
    T.CODE AS TYPECODE,
    T.NAME AS TYPENAME,
    M.CODE AS MAKERCODE,
    M.NAME AS TYPEMAKER,
    P.CODE AS PRODUCTCODE,
    P.NAME AS PRODUCTNAME,
    P.FINALPRICE AS PRODUCTPRICE    
FROM 
	MINIGAME MG
INNER JOIN 
	PROMOLINES PRL ON PRL.MINIGAME = MG.MINIGAME
INNER JOIN 
	PROMO PRO ON PRO.PROMO = PRL.PROMO
LEFT JOIN 
	PRODUCT P ON PRO.PRODUCT = P.PRODUCT
LEFT JOIN 
	MAKER M ON M.MAKER = PRO.MAKER
LEFT JOIN 
	TYPE T ON T.TYPE = PRO.TYPE
WHERE
	CAROUSEL = p_carousel;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetMinigamePromosConnect`(IN p_connectkey INT)
BEGIN
SELECT 
	PROMO.PROMO,
	PRODUCT.NAME as PRODUCTNAME,
	PRODUCT.PRODUCT as PRODUCT,
	TYPE.NAME as TYPENAME,
	MAKER.NAME as MAKERNAME,
	PROMO.DISCOUNT,
	PROMO.DAYSTOLIVE,
	PROMOLINES.CHANCE
FROM 
	PROMO
LEFT JOIN 
	PRODUCT ON PRODUCT.PRODUCT = PROMO.PRODUCT
LEFT JOIN 
	PROMOLINES ON PROMOLINES.PROMO = PROMO.PROMO
LEFT JOIN 
	MINIGAME ON MINIGAME.MINIGAME = PROMOLINES.MINIGAME
LEFT JOIN 
	CAROUSEL ON CAROUSEL.CAROUSEL = MINIGAME.CAROUSEL
LEFT JOIN 
	DEVICE ON DEVICE.DEVICE = CAROUSEL.DEVICE
LEFT JOIN 
	MAKER ON MAKER.MAKER = PROMO.MAKER
LEFT JOIN 
	TYPE ON TYPE.TYPE = PROMO.TYPE
WHERE 
	CONNECTKEY = p_connectkey;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetMinigameSettingsConnect`(IN p_connectkey INT)
BEGIN
    SELECT 
        m.revolutions,
        m.spinduration,
        m.onstoptime,
        m.inactivitytime
    FROM minigame m
    INNER JOIN carousel c ON c.carousel = m.carousel
    INNER JOIN device d ON d.device = c.device
    WHERE d.connectkey = p_connectkey;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetNextCarouselId`()
BEGIN
    select 
		carousel + 1 as NEXTID 
	from 
		carousel
	order by 
		carousel desc 
limit 1;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetNextProductId`()
BEGIN
    select 
		product + 1 as NEXTID 
    from 
		product
    order by 
		product desc 
    limit 1;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetNextPromoId`()
BEGIN
    select 
		promo + 1 as NEXTID 
	from 
		promo
	order by 
		promo desc 
limit 1;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetProductLinesByCarousel`(
    IN P_CAROUSEL INT
)
BEGIN

	SELECT 
		PR.PRODUCTLINES AS ID,
        PR.QUEUE,
        P.PRODUCT AS PRODUCTID,
        P.CODE AS PRODUCTCODE,
        P.NAME AS PRODUCTNAME,
        T.NAME AS TYPENAME,
        M.MAKER AS MAKERNAME
	FROM
		PRODUCTLINES PR
	INNER JOIN 
		PRODUCT P ON P.PRODUCT = PR.PRODUCT
	INNER JOIN 
		TYPE T ON T.TYPE = P.TYPE
	INNER JOIN
		MAKER M ON M.MAKER = P.MAKER
	WHERE 
		PR.CAROUSEL = P_CAROUSEL
	GROUP BY QUEUE;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetProducts`()
BEGIN
SELECT PRODUCT AS ID,P.CODE,P.NAME,T.NAME AS TYPE,M.NAME AS MAKER,PRICE,DISCOUNT,FINALPRICE,NOTES 
FROM PRODUCT P
INNER JOIN MAKER M ON M.MAKER = P.MAKER
INNER JOIN TYPE T ON T.TYPE = P.TYPE;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetPromoData`(IN p_redeemcode INT)
BEGIN
SELECT REDEEMCODE,
	DEVICE,
	CAROUSEL,
	MINIGAME,
	REDEEMED,
	ISSUEDATE,
	P.CODE,
	T.NAME AS TYPE,
	M.NAME AS MAKER,
    PR.NAME AS PRODUCT,
	P.DISCOUNT AS DISCOUNT,
	CHANCE,
	DAYSTOLIVE 
FROM 
	ISSUEDPROMO I
INNER JOIN 
	PROMO P ON I.PROMO = P.PROMO
LEFT JOIN 
	MAKER M ON M.MAKER = P.MAKER
LEFT JOIN 
	TYPE T ON T.TYPE = P.TYPE
LEFT JOIN 
	PRODUCT PR ON PR.PRODUCT = P.PRODUCT
WHERE REDEEMCODE = p_redeemcode;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetPromoLinesByCarousel`(
    IN P_CAROUSEL INT
)
BEGIN
	SELECT 
		PR.PROMOLINES AS ID,
        PR.CHANCE,
        PRO.PROMO AS PROMOID,
        PRO.CODE AS PROMOCODE,
		P.NAME AS PRODUCTNAME,
        PRO.DISCOUNT
	FROM
		PROMOLINES PR
	INNER JOIN 
		PROMO PRO ON PRO.PROMO = PR.PROMO
	INNER JOIN 
		PRODUCT P ON P.PRODUCT = PRO.PRODUCT
	WHERE 
		PR.MINIGAME = P_CAROUSEL;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetPromoStatus`(IN codetocheck VARCHAR(255))
BEGIN
    SELECT 
        CASE 
            WHEN NOT EXISTS (
                SELECT 1
                FROM ISSUEDPROMO
                WHERE REDEEMCODE = codetocheck
            ) THEN 0  -- Code does not exist

            WHEN EXISTS (
                SELECT 1
                FROM ISSUEDPROMO
                INNER JOIN PROMO ON ISSUEDPROMO.PROMO = PROMO.PROMO
                WHERE REDEEMCODE = codetocheck
                  AND REDEEMED = TRUE
            ) THEN 3  -- Code is redeemed

            WHEN EXISTS (
                SELECT 1
                FROM ISSUEDPROMO
                INNER JOIN PROMO ON ISSUEDPROMO.PROMO = PROMO.PROMO
                WHERE REDEEMCODE = codetocheck
                  AND ISSUEDATE >= DATE_SUB(NOW(), INTERVAL PROMO.DAYSTOLIVE DAY)
                  AND REDEEMED = FALSE
            ) THEN 1  -- Code is valid and not redeemed

            ELSE 2  -- Code is expired
        END AS status;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetTypes`()
BEGIN
SELECT TYPE AS ID,CODE,NAME FROM TYPE;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `InsertCarouselAndMinigame`(
    -- CAROUSEL fields
    IN p_code INT,
    IN p_name VARCHAR(255),
    IN p_device INT,
    IN p_autoplaywait INT,
    IN p_speed INT,
    IN p_gamecount INT,
    IN p_state INT,

    -- MINIGAME fields
    IN p_revolutions INT,
    IN p_spinduration INT,
    IN p_onstoptime INT,
    IN p_inactivitytime INT
)
BEGIN
    DECLARE new_carousel_id INT;

    -- Insert into CAROUSEL
    INSERT INTO CAROUSEL (
        CODE, NAME, DEVICE, AUTOPLAYWAIT, SPEED, GAMECOUNT, STATE
    ) VALUES (
        p_code, p_name, p_device, p_autoplaywait, p_speed, p_gamecount, p_state
    );

    -- Get the auto-generated ID
    SET new_carousel_id = LAST_INSERT_ID();

    -- Insert into MINIGAME
    INSERT INTO MINIGAME (
        CAROUSEL, REVOLUTIONS, SPINDURATION, ONSTOPTIME, INACTIVITYTIME
    ) VALUES (
        new_carousel_id, p_revolutions, p_spinduration, p_onstoptime, p_inactivitytime
    );
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `InsertIssuedPromo`(IN p_connectkey INT, p_redeemcode INT,  p_promo  INT)
BEGIN
INSERT INTO ISSUEDPROMO (
    REDEEMCODE,
    PROMO,
    DEVICE,
    CAROUSEL,
    MINIGAME,
    REDEEMED,
    ISSUEDATE
)
VALUES (
    p_redeemcode, 
    p_promo,
    (SELECT DEVICE FROM DEVICE WHERE CONNECTKEY = p_connectkey),
    (SELECT C.CAROUSEL FROM CAROUSEL C INNER JOIN DEVICE D ON D.DEVICE = C.CAROUSEL WHERE D.CONNECTKEY = p_connectkey),
    (SELECT M.MINIGAME FROM MINIGAME M INNER JOIN CAROUSEL C ON M.CAROUSEL = C.CAROUSEL INNER JOIN DEVICE D ON D.DEVICE = C.DEVICE WHERE D.CONNECTKEY = p_connectkey),
    FALSE,
    NOW()
);

END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `InsertMaker`(
    IN p_CODE        INT,
    IN p_NAME        VARCHAR(255)
)
BEGIN
    INSERT INTO MAKER (
        CODE, NAME
    ) VALUES (
        p_CODE, p_NAME
    );
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `InsertProduct`(
    IN p_CODE        INT,
    IN p_NAME        VARCHAR(255),
    IN p_TYPE        INT,
    IN p_MAKER       INT,
    IN p_PRICE       FLOAT,
    IN p_DISCOUNT    FLOAT,
    IN p_FINALPRICE  FLOAT,
    IN p_NOTES       VARCHAR(255)
)
BEGIN
    INSERT INTO PRODUCT (
        CODE, NAME, TYPE, MAKER, PRICE, DISCOUNT, FINALPRICE, NOTES
    ) VALUES (
        p_CODE, p_NAME, p_TYPE, p_MAKER, p_PRICE, p_DISCOUNT, p_FINALPRICE, p_NOTES
    );
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `InsertProductlines`(
    IN P_CAROUSEL INT,
    IN P_PRODUCT INT,
    IN P_QUEUE INT
)
BEGIN
    INSERT INTO PRODUCTLINES (CAROUSEL, PRODUCT, QUEUE)
    VALUES (P_CAROUSEL, P_PRODUCT, P_QUEUE);
	END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `InsertPromo`(
    IN p_CODE INT,
    IN p_PRODUCT INT,
    IN p_TYPE INT,
    IN p_MAKER INT,
    IN p_NOTES VARCHAR(255),
    IN p_DISCOUNT FLOAT,
    IN p_DAYSTOLIVE INT
)
BEGIN
    INSERT INTO PROMO (CODE, PRODUCT, TYPE, MAKER, NOTES, DISCOUNT, DAYSTOLIVE)
    VALUES (p_CODE, p_PRODUCT, p_TYPE, p_MAKER, p_NOTES, p_DISCOUNT, p_DAYSTOLIVE);
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `InsertPromoLines`(
    IN p_PROMO INT,
    IN p_MINIGAME INT,
    IN p_CHANCE FLOAT
)
BEGIN
    INSERT INTO PROMOLINES (PROMO, MINIGAME, CHANCE)
    VALUES (p_PROMO, p_MINIGAME, p_CHANCE);
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `InsertType`(
    IN p_CODE        INT,
    IN p_NAME        VARCHAR(255)
)
BEGIN
    INSERT INTO TYPE (
        CODE, NAME
    ) VALUES (
        p_CODE, p_NAME
    );
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `ResetDummyData`()
BEGIN
DELETE FROM BACKSWIPES;
DELETE FROM CAROUSEL;
DELETE FROM DEVICE;
DELETE FROM ISSUEDPROMO;
DELETE FROM MAKER;
DELETE FROM MINIGAME;
DELETE FROM PRODUCT;
DELETE FROM PRODUCTLINES;
DELETE FROM PROMO;
DELETE FROM PROMOLINES;
DELETE FROM TYPE;
DELETE FROM USER;

ALTER TABLE BACKSWIPES AUTO_INCREMENT = 1;
ALTER TABLE CAROUSEL AUTO_INCREMENT = 1;
ALTER TABLE DEVICE AUTO_INCREMENT = 1;
ALTER TABLE ISSUEDPROMO AUTO_INCREMENT = 1;
ALTER TABLE MAKER AUTO_INCREMENT = 1;
ALTER TABLE MINIGAME AUTO_INCREMENT = 1;
ALTER TABLE PRODUCT AUTO_INCREMENT = 1;
ALTER TABLE PRODUCTLINES AUTO_INCREMENT = 1;
ALTER TABLE PROMO AUTO_INCREMENT = 1;
ALTER TABLE PROMOLINES AUTO_INCREMENT = 1;
ALTER TABLE TYPE AUTO_INCREMENT = 1;
ALTER TABLE USER AUTO_INCREMENT = 1;



INSERT INTO USER(username,password) VALUES ("Admin","admin");
INSERT INTO DEVICE(code,name,lastping,connectkey) VALUES (100,"Rasp1",NOW(),"1234"),(200,"Rasp2",NOW(),"5678");
INSERT INTO MAKER(code,name) VALUES (100,"Dell"),(200,"Sony"),(300,"Intel"),(400,"Nvidia"),(500,"Razer");
INSERT INTO TYPE(code,name) VALUES (10,"Console"),("20","Monitor"),("30","CPU"),("31","GPU"),("33","SSD"),("40","Peripheral");
INSERT INTO PRODUCT (CODE, NAME, TYPE, MAKER, PRICE, DISCOUNT, FINALPRICE, NOTES) VALUES
(1001, 'Alienware X16'				, 1, 1, 1800.00, 0.1, 1620.00, 'High-performance gaming laptop'),
(1002, 'PlayStation 5 Pro'			, 1, 2, 599.99, 0.05, 569.99, 'Next-gen gaming console with enhanced features'),
(1003, 'Core i7-14700K'				, 3, 3, 429.00, 0.1, 386.10, 'High-performance desktop CPU'),
(1004, 'GeForce RTX 4060 Ti'		, 4, 4, 399.00, 0.1, 359.10, 'Mid-range gaming GPU'),
(1005, 'Razer BlackShark V2'		, 6, 5, 129.99, 0.15, 110.49, 'Esports headset'),
(1006, 'Ultrasharp U2723QE'			, 2, 1, 650.00, 0.1, 585.00, '4K professional monitor'),
(1007, 'INZONE M9'					, 2, 2, 899.99, 0.1, 809.99, 'Sony 4K gaming monitor'),
(1008, 'Xeon Platinum 8490H'		, 3, 3, 7900.00, 0, 7900.00, 'Data center processor'),
(1009, 'GeForce RTX 4080'			, 4, 4, 1199.00, 0, 1199.00, 'High-end gaming GPU'),
(1010, 'Razer Basilisk V3 Pro'		, 6, 5, 159.99, 0.15, 135.99, 'Customizable gaming mouse'),
(1011, 'Inspiron 16 Plus'			, 1, 1, 1200.00, 0.1, 1080.00, 'Everyday performance laptop'),
(1012, 'PlayStation VR2'			, 1, 2, 549.99, 0.1, 494.99, 'Immersive VR headset for console'),
(1013, 'Core i5-13400F'				, 3, 3, 189.00, 0.1, 170.10, 'Budget desktop CPU'),
(1014, 'GeForce GTX 1650'			, 4, 4, 149.00, 0.05, 141.55, 'Entry-level GPU'),
(1015, 'Razer Kiyo Pro'				, 6, 5, 199.99, 0.1, 179.99, 'High-quality webcam for streaming'),
(1016, 'Dell OptiPlex 7000'			, 1, 1, 850.00, 0.12, 748.00, 'Business desktop computer'),
(1017, 'INZONE Buds'				, 6, 2, 179.99, 0.1, 161.99, 'Wireless gaming earbuds'),
(1018, 'Optane SSD P5800X'			, 5, 3, 1299.00, 0.15, 1104.15, 'High-performance SSD for enterprise'),
(1019, 'Razer Huntsman V2 Analog'	, 6, 5, 249.99, 0.1, 224.99, 'Analog optical gaming keyboard'),
(1020, 'NVIDIA Titan RTX'			, 4, 4, 2499.00, 0.1, 2249.10, 'Flagship professional GPU'),
(1021, 'Intel Optane SSD 900P'		, 5, 3, 499.99, 0.1, 449.99, 'High-end NVMe SSD for enthusiasts'),
(1022, 'Razer Core X Chroma SSD Dock', 5, 5, 299.99, 0.15, 254.99, 'External SSD dock with RGB and Thunderbolt 3');
INSERT INTO PRODUCTLINES(CAROUSEL,PRODUCT,QUEUE) VALUES (1,3,1),(1,8,2),(1,13,3),(1,4,4),(1,9,5),(1,14,6),(1,20,7),(1,18,8),(1,21,9),(1,22,10);
INSERT INTO CAROUSEL (CODE,NAME,DEVICE,NOTES,AUTOPLAYWAIT,SPEED,GAMECOUNT) VALUES (1,"PC PARTS",1,"Contains only pc parts starting with CPUs",1000,3000,4),(2,"Consoles",null,"Contains only consoles",500,1000,2);
INSERT INTO MINIGAME (CAROUSEL,REVOLUTIONS,SPINDURATION,ONSTOPTIME,INACTIVITYTIME) VALUES (1,2,1000,30000,30000),(2,3,500,30000,30000);
INSERT INTO BACKSWIPES (PRODUCTLINES,SWIPEDATE) VALUES (4,NOW()),(2,NOW()),(4,NOW()),(4,NOW()),(5,NOW()),(5,NOW()),(4,NOW()),(4,NOW()),(6,NOW()),(6,NOW()),(6,NOW()),(4,NOW()),(7,NOW());
INSERT INTO PROMO (CODE,DISCOUNT,PRODUCT,TYPE,MAKER,DAYSTOLIVE,NOTES) VALUES (50,0.5,20,0,0,7,"Special promo"),(51,0.2,10,0,0,7,"Use until 11/7/2025"),(52,0.2,7,0,0,7,"Limited 5");
INSERT INTO PROMOLINES (MINIGAME,PROMO,CHANCE) VALUES (1,1,0.1),(1,2,0.3),(1,3,0.3),(1,4,0.15),(1,5,0.15);
INSERT INTO ISSUEDPROMO (REDEEMCODE,PROMO,DEVICE,CAROUSEL,MINIGAME,REDEEMED,ISSUEDATE) VALUES (154165,2,1,1,1,TRUE,NOW()),(781569,2,1,1,1,FALSE,NOW()),(346518,3,1,1,1,FALSE,NOW()),(347196,4,1,1,1,FALSE,NOW()),(978745,5,2,1,1,FALSE,NOW()),(154879,1,2,1,1,FALSE,NOW());


END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `UpdateCarouselAndMinigame`(
    IN p_carousel_id INT,

    -- CAROUSEL fields
    IN p_code INT,
    IN p_name VARCHAR(255),
    IN p_device INT,
    IN p_autoplaywait INT,
    IN p_speed INT,
    IN p_gamecount INT,
    IN p_state INT,

    -- MINIGAME fields
    IN p_revolutions INT,
    IN p_spinduration INT,
    IN p_onstoptime INT,
    IN p_inactivitytime INT
)
BEGIN
    -- Update CAROUSEL
    UPDATE CAROUSEL
    SET 
        CODE = p_code,
        NAME = p_name,
        DEVICE = p_device,
        AUTOPLAYWAIT = p_autoplaywait,
        SPEED = p_speed,
        GAMECOUNT = p_gamecount,
        STATE = p_state
    WHERE CAROUSEL = p_carousel_id;

    -- Update MINIGAME associated with this CAROUSEL
    UPDATE MINIGAME
    SET
        REVOLUTIONS = p_revolutions,
        SPINDURATION = p_spinduration,
        ONSTOPTIME = p_onstoptime,
        INACTIVITYTIME = p_inactivitytime
    WHERE CAROUSEL = p_carousel_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `UpdateDeviceLastPing`(IN p_connectkey VARCHAR(255))
BEGIN
    UPDATE DEVICE
    SET LASTPING = NOW()
    WHERE CONNECTKEY = p_connectkey;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `UpdateMaker`(
    IN p_maker_id INT,
    IN p_code INT,
    IN p_name VARCHAR(255)
)
BEGIN
    UPDATE MAKER
    SET
        CODE = COALESCE(p_code, CODE),
        NAME = COALESCE(p_name, NAME)
    WHERE MAKER = p_maker_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `UpdateProduct`(
    IN p_PRODUCT     INT,
    IN p_CODE        INT,
    IN p_NAME        VARCHAR(255),
    IN p_TYPE        INT,
    IN p_MAKER       INT,
    IN p_PRICE       FLOAT,
    IN p_DISCOUNT    FLOAT,
    IN p_FINALPRICE  FLOAT,
    IN p_NOTES       VARCHAR(255)
)
BEGIN
    UPDATE PRODUCT
    SET
        CODE       = IF(p_CODE IS NOT NULL, p_CODE, CODE),
        NAME       = IF(p_NAME IS NOT NULL, p_NAME, NAME),
        TYPE       = IF(p_TYPE IS NOT NULL, p_TYPE, TYPE),
        MAKER      = IF(p_MAKER IS NOT NULL, p_MAKER, MAKER),
        PRICE      = IF(p_PRICE IS NOT NULL, p_PRICE, PRICE),
        DISCOUNT   = IF(p_DISCOUNT IS NOT NULL, p_DISCOUNT, DISCOUNT),
        FINALPRICE = IF(p_FINALPRICE IS NOT NULL, p_FINALPRICE, FINALPRICE),
        NOTES      = IF(p_NOTES IS NOT NULL, p_NOTES, NOTES)
    WHERE PRODUCT = p_PRODUCT;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `UpdateProductlines`(
    IN P_PRODUCTLINES INT,
    IN P_CAROUSEL INT,
    IN P_PRODUCT INT,
    IN P_QUEUE INT
)
BEGIN
    UPDATE PRODUCTLINES
    SET
        CAROUSEL     = P_CAROUSEL,
        PRODUCT  = P_PRODUCT,
        QUEUE    = P_QUEUE
    WHERE PRODUCTLINES = P_PRODUCTLINES;
	END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `UpdatePromo`(
    IN p_PROMO INT,
    IN p_CODE INT,
    IN p_PRODUCT INT,
    IN p_TYPE INT,
    IN p_MAKER INT,
    IN p_NOTES VARCHAR(255),
    IN p_DISCOUNT FLOAT,
    IN p_DAYSTOLIVE INT
)
BEGIN
    UPDATE PROMO
    SET
        CODE = p_CODE,
        PRODUCT = p_PRODUCT,
        TYPE = p_TYPE,
        MAKER = p_MAKER,
        NOTES = p_NOTES,
        DISCOUNT = p_DISCOUNT,
        DAYSTOLIVE = p_DAYSTOLIVE
    WHERE PROMO = p_PROMO;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `UpdatePromoLines`(
    IN p_PROMOLINES INT,
    IN p_PROMO INT,
    IN p_MINIGAME INT,
    IN p_CHANCE FLOAT
)
BEGIN
    UPDATE PROMOLINES
    SET
        PROMO     = p_PROMO,
        MINIGAME  = p_MINIGAME,
        CHANCE    = p_CHANCE
    WHERE PROMOLINES = p_PROMOLINES;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `UpdateRedeemed`(IN p_redeemcode INT)
BEGIN
UPDATE ISSUEDPROMO 
SET REDEEMED = 1, 
REDEEMDATE = NOW()
WHERE REDEEMCODE = p_redeemcode;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `UpdateType`(
    IN p_type_id INT,
    IN p_code INT,
    IN p_name VARCHAR(255)
)
BEGIN
    UPDATE TYPE
    SET
        CODE = COALESCE(p_code, CODE),
        NAME = COALESCE(p_name, NAME)
    WHERE TYPE = p_type_id;
END$$
DELIMITER ;
