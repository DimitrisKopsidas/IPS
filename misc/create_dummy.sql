INSERT INTO USER(username,password) VALUES ("Admin","1212"),("Admin2","1313");
INSERT INTO DEVICE(code,name,location,lastping,url) VALUES (100,"Rasp1","Storefront",NOW(),"1945417153498972");
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
(1008, 'Xeon Platinum 8490H'		, 3, 3, 7900.00, 0.05, 7505.00, 'Data center processor'),
(1009, 'GeForce RTX 4080'			, 4, 4, 1199.00, 0.1, 1079.10, 'High-end gaming GPU'),
(1010, 'Razer Basilisk V3 Pro'		, 6, 5, 159.99, 0.15, 135.99, 'Customizable gaming mouse'),
(1011, 'Inspiron 16 Plus'			, 1, 1, 1200.00, 0.1, 1080.00, 'Everyday performance laptop'),
(1012, 'PlayStation VR2'			, 1, 2, 549.99, 0.1, 494.99, 'Immersive VR headset for console'),
(1013, 'Core i5-13400F'				, 3, 3, 189.00, 0.1, 170.10, 'Budget desktop CPU'),
(1014, 'GeForce GTX 1650'			, 4, 4, 149.00, 0.05, 141.55, 'Entry-level GPU'),
(1015, 'Razer Kiyo Pro'				, 6, 5, 199.99, 0.1, 179.99, 'High-quality webcam for streaming'),
(1016, 'OptiPlex 7000'				, 2, 1, 850.00, 0.12, 748.00, 'Business desktop monitor'),
(1017, 'INZONE Buds'				, 6, 2, 179.99, 0.1, 161.99, 'Wireless gaming earbuds'),
(1018, 'Optane SSD P5800X'			, 5, 3, 1299.00, 0.15, 1104.15, 'High-performance SSD for enterprise'),
(1019, 'Razer Huntsman V2 Analog'	, 6, 5, 249.99, 0.1, 224.99, 'Analog optical gaming keyboard'),
(1020, 'NVIDIA Titan RTX'			, 4, 4, 2499.00, 0.1, 2249.10, 'Flagship professional GPU'),
(1021, 'Intel Optane SSD 900P'		, 5, 3, 499.99, 0.1, 449.99, 'High-end NVMe SSD for enthusiasts'),
(1022, 'Razer Core X Chroma SSD Dock', 5, 5, 299.99, 0.15, 254.99, 'External SSD dock with RGB and Thunderbolt 3');
INSERT INTO PRODUCTLINES(CAROUSEL,PRODUCT,QUEUE) VALUES (1,3,1),(1,8,2),(1,13,3),(1,4,4),(1,9,5),(1,14,6),(1,20,7),(1,18,8),(1,21,9),(1,22,10);
INSERT INTO CAROUSEL (CODE,NAME,DEVICE,NOTES,AUTOPLAYWAIT,SPEED,GAMECOUNT,COOLDOWN) VALUES (1,"PC PARTS",1,"Contains only pc parts starting with CPUs",1000,3000,4,10000);
INSERT INTO WHEEL (CAROUSEL,REVOLUTIONS,SPINDURATION,ONSTOPTIME,INACTIVITYTIME) VALUES (1,4,3000,3000,10);
INSERT INTO BACKSWIPES (PRODUCTLINES,SWIPEDATE) VALUES (4,NOW()),(2,NOW()),(4,NOW()),(4,NOW()),(5,NOW()),(5,NOW()),(4,NOW()),(4,NOW()),(6,NOW()),(6,NOW()),(6,NOW()),(4,NOW()),(7,NOW());
INSERT INTO PROMO (CODE,DISCOUNT,PRODUCT,TYPE,MAKER,CHANCE,TOTAL,DAYSTOLIVE) VALUES (50,0.5,1,NULL,NULL,0.1,1,7),(51,0.2,2,NULL,NULL,0.3,3,7),(52,0.2,3,NULL,NULL,0.3,3,7),(53,0.1,NULL,3,NULL,0.15,2,7),(54,0.1,NULL,NULL,3,0.15,2,7);
INSERT INTO PROMOLINES (WHEEL,PROMO) VALUES (1,1),(1,2),(1,3),(1,4),(1,5);
INSERT INTO ISSUEDPROMO (REDEEMCODE,PROMO,WHEEL,REDEEMED,ISSUEDATE) VALUES (154165,2,1,TRUE,NOW()),(781569,2,1,FALSE,NOW()),(346518,3,1,FALSE,NOW()),(347196,4,1,FALSE,NOW()),(978745,5,1,FALSE,NOW()),(154879,1,1,FALSE,'2025-05-01 19:23:44');
