ALTER TABLE `products` ADD COLUMN `brand` VARCHAR(255);

ALTER TABLE `products` ADD COLUMN `imageUrls` JSON;

ALTER TABLE `products` ADD COLUMN `mrp` FLOAT;

ALTER TABLE `products` ADD COLUMN `discountPercent` INT;

ALTER TABLE `products` ADD COLUMN `currency` VARCHAR(10) DEFAULT 'INR';

ALTER TABLE `products` ADD COLUMN `rating` FLOAT;

ALTER TABLE `products` ADD COLUMN `ratingCount` INT;

ALTER TABLE `products` ADD COLUMN `offers` JSON;

ALTER TABLE `products` ADD COLUMN `colors` JSON;

ALTER TABLE `products` ADD COLUMN `sizes` JSON;

ALTER TABLE `products` ADD COLUMN `delivery` JSON;

ALTER TABLE `products` ADD COLUMN `topReview` JSON;

ALTER TABLE `products` ADD COLUMN `store` JSON;

ALTER TABLE `products` ADD COLUMN `isWishlisted` BOOLEAN DEFAULT FALSE;

ALTER TABLE `products` ADD COLUMN `shareUrl` VARCHAR(255);
