-- Amira E-commerce Database Schema & Seed Data (Rev 5)

-- Drop existing tables to ensure clean, relational migrations (prevents leftover/orphaned demo data)
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS product_sizes;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- 1. Users Table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('customer', 'admin')) DEFAULT 'customer',
    reset_token TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE
);

-- 3. Products Table
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    price REAL NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE RESTRICT,
    image_url TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Product Sizes & Stock Table
CREATE TABLE product_sizes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    stock INTEGER DEFAULT 0,
    UNIQUE(product_id, size)
);

-- 5. Orders Table
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    total_amount REAL NOT NULL,
    status TEXT CHECK(status IN ('Pending', 'Shipped', 'Delivered', 'Cancelled')) DEFAULT 'Pending',
    shipping_address TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Order Items Table
CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    size TEXT NOT NULL DEFAULT 'M',
    quantity INTEGER NOT NULL,
    price REAL NOT NULL
);

-- 7. Cart Table
CREATE TABLE cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    size TEXT NOT NULL DEFAULT 'M',
    quantity INTEGER NOT NULL,
    UNIQUE(user_id, product_id, size)
);

-- ----------------------------------------------------
-- Seed Categories
-- ----------------------------------------------------
INSERT INTO categories (id, name, slug) VALUES (1, 'Dresses - Women', 'dresses-women');
INSERT INTO categories (id, name, slug) VALUES (2, 'Dresses - Men', 'dresses-men');
INSERT INTO categories (id, name, slug) VALUES (3, 'Traditional - Indian', 'traditional-indian');
INSERT INTO categories (id, name, slug) VALUES (4, 'Traditional - Arab', 'traditional-arab');
INSERT INTO categories (id, name, slug) VALUES (5, 'Traditional - Japan', 'traditional-japan');
INSERT INTO categories (id, name, slug) VALUES (6, 'Shoes & Jewellery', 'shoes-jewellery');

-- ----------------------------------------------------
-- Seed Products (Sanitized & De-duplicated)
-- ----------------------------------------------------
INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (1, 'Champagne Satin Bridal Abaya Set', 'Luxurious champagne-gold satin abaya featuring a matching fluid satin inner slip dress and silk chiffon hijab, detailed with hand-embroidered floral sleeve cuffs.', 400.00, 4, '/images/abaya_abaya__1_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (2, 'Saudi Gold Shimmer Party Abaya', 'Saudi-style pure white party wear abaya woven with metallic gold shimmer threads, offering a flowing silhouette and matching gold-lace embellished borders.', 550.00, 4, '/images/abaya_abaya__2_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (3, 'Golden Branch Moon Silk Abaya', 'Traditional Dubai abaya in deep olive brown silk crepe, featuring intricate golden tree branch embroidery along the sleeves and crescent hemline.', 530.00, 4, '/images/abaya_abaya__3_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (4, 'Mermaid Gown & Beige Groom Tuxedo Set', 'A premium wedding reception couple set featuring a white crepe silk mermaid gown with a glittering sequined cape overlay, paired with a slim-fit beige groom tuxedo.', 340.00, 1, '/images/combo_dress__1_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (5, 'Midnight Embellished Hijabi Bridal Gown Set', 'An exquisite modern Arab couple set including a fitted black bridal gown with dense sequin lace work, a matching silk hijab, and a classic black three-piece groom suit.', 360.00, 4, '/images/combo_dress__2_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (6, 'Ivory Walima Anarkali & Sherwani Set', 'A traditional South Asian walima couple outfit set showcasing an ivory flared Anarkali gown with gold zari threadwork, paired with a matching structured silk sherwani.', 560.00, 3, '/images/combo_dress__3_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (7, 'Royal Maroon Lehenga & Sherwani Couple Suit', 'A premium deep maroon velvet couple set featuring a heavily embroidered bridal lehenga choli and a matching raw silk groom sherwani with antique gold borders.', 350.00, 3, '/images/combo_dress__4_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (8, 'Sage Green Banarasi Silk Couple Set', 'A coordinated South Asian ethnic couple outfit set in soft sage green Banarasi silk, detailed with matching woven floral prints and gold threadwork.', 520.00, 3, '/images/combo_dress__5_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (9, 'Gold Brocade Silk Sherwani', 'A structured groom sherwani crafted in royal gold brocade silk, detailed with hand-tailored bandhgala collar buttons and a matching beige churidar.', 570.00, 3, '/images/indian_men_wedding_dress_dress__1_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (10, 'Ivory Lucknowi Chikankari Sherwani', 'A refined ivory wedding sherwani featuring detailed Lucknowi Chikankari floral embroidery on handloom silk, complete with gold buttons.', 320.00, 3, '/images/indian_men_wedding_dress_dress__2_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (11, 'Traditional Crimson Velvet Sherwani', 'Deep crimson red velvet groom sherwani embellished with intricate zari embroidery along the cuffs and collar, perfect for traditional Indian weddings.', 330.00, 3, '/images/indian_men_wedding_dress_dress__3_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (12, 'Classic Black Bandhgala Silk Kurta Set', 'A sleek black Banarasi silk bandhgala kurta set featuring a structured collar, matching trouser pajama, and handloom embroidery details.', 370.00, 3, '/images/indian_men_wedding_dress_dress__4_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (13, 'Ivory Embroidered Walima Anarkali Gown', 'Flared ivory white Anarkali bridal gown with sheer georgette sleeves and hand-embroidered silver dabka and zari floral motifs.', 320.00, 3, '/images/indian_wedding_dress_women_dress__1_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (14, 'Royal Maroon Embroidered Lehenga Choli', 'Deep maroon velvet bridal lehenga choli set decorated with dense gold threadwork, semi-precious bead embellishments, and a net dupatta.', 330.00, 3, '/images/indian_wedding_dress_women_dress__2_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (15, 'Blush Pink Silk Lehenga Set', 'Bespoke blush pink raw silk bridal lehenga with mint green border highlights, hand-tailored with detailed floral embroidery and sequin lines.', 440.00, 3, '/images/indian_wedding_dress_women_dress__3_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (16, 'Teal Banarasi Silk Saree', 'A luxury teal-colored Banarasi silk saree featuring handwoven golden zari floral borders, matching pallu details, and a raw silk blouse.', 500.00, 3, '/images/indian_wedding_dress_women_dress__4_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (17, 'Deep Crimson Zardozi Lehenga', 'A traditional deep crimson red bridal lehenga heavily adorned with zardozi embroidery, dabka work, and semi-precious stone beadings.', 360.00, 3, '/images/indian_wedding_dress_women_dress__5_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (18, 'Pastel Mint Green Wedding Lehenga', 'A modern pastel mint green organza lehenga choli set featuring mirror work, pink floral embroidery, and a matching sheer dupatta.', 330.00, 3, '/images/indian_wedding_dress_women_dress__6_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (19, 'Sage Green Embroidered Silk Saree', 'Elegant sage green georgette saree featuring intricate handloom embroidery along the borders, completed with a matching silk blouse.', 330.00, 3, '/images/indian_wedding_dress_women_dress__7_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (20, 'Deep Ruby Velvet Bridal Lehenga', 'A stunning deep ruby red velvet bridal lehenga featuring royal peacock motif embroideries, gold threadwork, and double dupatta styling.', 420.00, 3, '/images/indian_wedding_dress_women_dress__8_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (21, 'Classic Black Wedding Montsuki Hakama', 'Traditional Japanese groom wedding attire featuring a black silk kimono jacket with five family crests, pleated grey hakama trousers, and a white obi sash.', 520.00, 5, '/images/japan_men_dress_dress__1_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (22, 'Navy Silk Hakama Kimono Set', 'A formal navy blue silk kimono paired with striped grey hakama trousers and a matching haori jacket, tailored for traditional Japanese ceremonies.', 510.00, 5, '/images/japan_men_dress_dress__2_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (23, 'Grey Pinstripe Groom Hakama', 'Traditional Japanese pinstriped grey silk hakama trousers paired with a structured black kimono jacket and matching white cord ties.', 550.00, 5, '/images/japan_men_dress_dress__3_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (24, 'Embroidered Crane Haori Kimono', 'A luxurious deep navy blue haori jacket featuring hand-embroidered white cranes on the back, representing longevity, paired with matching hakama trousers.', 420.00, 5, '/images/japan_men_dress_dress__4_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (25, 'White Satin Wedding Montsuki Hakama', 'An elegant pure white silk montsuki kimono jacket with family crests, paired with textured grey and silver pleated hakama trousers.', 330.00, 5, '/images/japan_men_dress_dress__5_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (26, 'Charcoal Silk Groom Kimono Set', 'Traditional Japanese wedding kimono set in textured charcoal silk, complete with a structured haori coat and white tie details.', 550.00, 5, '/images/japan_men_dress_dress__6_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (27, 'Forest Green Haori & Hakama Suit', 'A custom forest green silk haori jacket paired with classic striped hakama trousers, offering a colorful traditional Japanese groom look.', 340.00, 5, '/images/japan_men_dress_dress__7_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (28, 'White Silk Uchikake Bridal Kimono', 'A premium pure white silk Uchikake bridal kimono featuring embossed floral crane patterns and a heavily padded red hemline.', 370.00, 5, '/images/japan_women_dress_dress__1_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (29, 'Scarlet Crane Uchikake Kimono', 'Traditional scarlet red Japanese bridal Uchikake kimono decorated with gold foil details and hand-embroidered flying crane patterns.', 550.00, 5, '/images/japan_women_dress_dress__2_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (30, 'Pink Floral Furisode Kimono', 'A modern pastel pink silk Furisode kimono featuring long flowing sleeves and printed cherry blossom and peony patterns, tailored for bridal banquets.', 420.00, 5, '/images/japan_women_dress_dress__3_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (31, 'Golden Brocade Uchikake Kimono', 'A luxurious Japanese bridal kimono woven in heavy golden brocade silk, depicting pine forests and traditional fans in multi-colored silk threads.', 440.00, 5, '/images/japan_women_dress_dress__4_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (32, 'Lavender Silk Bridal Furisode', 'A premium lavender purple silk Furisode kimono featuring hand-painted floral bouquets along the hemline and sleeves, finished with a silver obi.', 380.00, 5, '/images/japan_women_dress_dress__5_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (33, 'Emerald Silk Uchikake Wedding Gown', 'Stunning emerald green Japanese wedding kimono featuring gold embroidery, cherry blossoms, and classic crane prints, heavily padded at the base.', 560.00, 5, '/images/japan_women_dress_dress__6_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (34, 'Royal Indian Kundan Choker Set', 'A magnificent royal choker necklace set featuring multi-layered Kundan stones, raw emerald hangings, and matching teardrop earrings.', 150.00, 6, '/images/jewellary_jewellery__1_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (35, 'Korean Gold Floral Jewelry Set', 'A minimalist gold necklace and earrings set featuring Korean-inspired gold floral shapes with tiny pearl centers.', 140.00, 6, '/images/jewellary_jewellery__10_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (36, 'Pastel Tulip Gemstone Bracelet', 'A dainty gold leaf bracelet decorated with pastel-colored gemstone tulips, perfect for spring weddings and bridesmaid gifts.', 90.00, 6, '/images/jewellary_jewellery__11_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (37, 'Minimalist Pearl Choker Set', 'A delicate bridal choker set featuring pure white freshwater pearls linked by a minimalist gold chain, complete with matching stud earrings.', 200.00, 6, '/images/jewellary_jewellery__2_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (38, 'Classic Diamond Teardrop Necklace', 'A sparkling diamond choker necklace featuring a central teardrop-cut cubic zirconia pendant, paired with matching hanging earrings.', 160.00, 6, '/images/jewellary_jewellery__3_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (39, 'Emerald Cut Bridal Necklace Set', 'Intricate silver-plated necklace adorned with square emerald-cut green gemstones, completed with drop earrings and a matching bracelet.', 190.00, 6, '/images/jewellary_jewellery__4_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (40, 'Gold Filigree Bridal Choker Set', 'An intricate traditional gold filigree choker set featuring detailed leaf engravings, micro bead lines, and hanging teardrop earrings.', 170.00, 6, '/images/jewellary_jewellery__5_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (41, 'Pastel Floral Pearl Jewellery Set', 'A modern bridal jewellery set in rose gold, featuring pastel pink flower motifs, freshwater pearls, and cubic zirconia stones.', 200.00, 6, '/images/jewellary_jewellery__6_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (42, 'Rose Gold Crystal Flower Set', 'A delicate rose gold jewellery set featuring crystal-studded flower pendants, a dainty chain necklace, and matching hook earrings.', 110.00, 6, '/images/jewellary_jewellery__7_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (43, 'Multi-Row Pearl Necklace Set', 'A classic bridal set featuring a three-row pearl strand necklace with a central diamond brooch clasp, matching drop earrings.', 180.00, 6, '/images/jewellary_jewellery__8_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (44, 'Burgundy Velvet Teardrop Jewelry Set', 'A dramatic bridal jewelry set featuring burgundy red teardrop crystals set in antique gold, complete with matching earrings.', 200.00, 6, '/images/jewellary_jewellery__9_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (45, 'Polished Black Patent Leather Oxfords', 'Timeless black patent leather oxford dress shoes, featuring a sleek cap toe design, waxed laces, and leather soles for formal weddings.', 180.00, 6, '/images/men_wedding_shoe_shoe__1_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (46, 'Refined Tan Suede Loafers', 'Elegant tan suede slip-on loafers, detailed with a gold-tone horsebit buckle, perfect for modern groom beach or reception wear.', 150.00, 6, '/images/men_wedding_shoe_shoe__2_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (47, 'Classic Brown Leather Brogues', 'Traditional wingtip brown leather brogues, featuring detailed perforated wingtip patterns and a dark wood stacked heel.', 210.00, 6, '/images/men_wedding_shoe_shoe__3_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (48, 'Cream Linen Slip-On Loafers', 'Minimalist cream-colored linen slip-on loafers, offering a relaxed yet refined option for summer and destination weddings.', 160.00, 6, '/images/men_wedding_shoe_shoe__4_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (49, 'Refined Beige Dress Shoes', 'Modern beige leather dress shoes featuring a clean plain-toe silhouette, double stitching, and a comfortable leather lining.', 150.00, 6, '/images/men_wedding_shoe_shoe__5_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (50, 'Diamond Solitaire Halo Engagement Ring', 'A timeless platinum engagement ring featuring a brilliant-cut diamond solitaire surrounded by a delicate pavé halo band.', 200.00, 6, '/images/rings_rings__1_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (51, 'Emerald Cut Diamond Ring Set', 'A premium 18k white gold ring set featuring an emerald-cut central diamond, flanked by tapered baguette stones.', 190.00, 6, '/images/rings_rings__2_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (52, 'Vintage Rose Gold Floral Band', 'A romantic rose gold wedding band engraved with vintage floral filigree and set with tiny brilliant-cut diamonds.', 120.00, 6, '/images/rings_rings__3_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (53, 'Sapphire Pear Drop Promise Ring', 'A dainty white gold promise ring featuring a pear-shaped royal blue sapphire, accented by tiny diamond side leaves.', 110.00, 6, '/images/rings_rings__4_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (54, 'Classic Gold Infinity Wedding Band', 'A solid 18k yellow gold wedding band featuring a modern infinity twist design, polished to a high mirror shine.', 100.00, 6, '/images/rings_rings__5_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (55, 'Marquise Cut Eternity Ring', 'An elegant eternity ring band set with marquise-cut sparkling diamonds in a modern claw setting.', 160.00, 6, '/images/rings_rings__6_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (56, 'Oval Morganite Bridal Ring', 'A stunning rose gold ring featuring a central oval-cut pink morganite stone, surrounded by a double diamond halo.', 200.00, 6, '/images/rings_rings__7_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (57, 'Trillion Cut Amethyst Engagement Ring', 'Bespoke platinum engagement ring showcasing a trillion-cut purple amethyst stone, accented by diamond pavé shoulders.', 120.00, 6, '/images/rings_rings__8_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (58, 'Royal Navy Double-Breasted Pinstripe Suit', 'A premium navy blue wool double-breasted suit featuring white pinstripes, peak lapels, gold buttons, and white tailored trousers.', 390.00, 2, '/images/wedding_dress_men_dress__1_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (59, 'Classic Black Shawl Tuxedo', 'A formal black groom tuxedo jacket featuring satin shawl lapels, a single button closure, and matching satin-stripe trousers.', 420.00, 2, '/images/wedding_dress_men_dress__2_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (60, 'Old Money Beige Tailored Suit', 'A refined beige wool-blend groom suit in old money style, featuring a structured jacket, white shirt, and matching beige trousers.', 370.00, 2, '/images/wedding_dress_men_dress__3_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (61, 'Beige Silk Tie Groom Set', 'A modern groom wedding blazer set in sand beige, complete with a brown silk tie, gold tie clip, and white pocket square.', 470.00, 2, '/images/wedding_dress_men_dress__4_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (62, 'Modern Sage Green Wedding Suit', 'An elegant sage green two-piece suit set featuring a modern cut, matching vest, white dress shirt, and sauge trousers.', 530.00, 2, '/images/wedding_dress_men_dress__5_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (63, 'Ivory Frock Coat Tailcoat Suit', 'A luxurious ivory white frock coat tailcoat suit with historical flared overcoat lines, tailored for royal and classic weddings.', 470.00, 2, '/images/wedding_dress_men_dress__6_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (64, 'Elegant Long Sleeve Floral Lace Gown', 'A romantic white bridal gown featuring detailed sheer floral lace overlays on the bodice, long sleeves, and a flowing tulle skirt.', 350.00, 1, '/images/wedding_dress_women_dress__1_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (65, 'Classic Ivory Silk A-Line Dress', 'An elegant, timeless A-line wedding dress made of heavy ivory silk satin, featuring a structured strapless bodice and long train.', 340.00, 1, '/images/wedding_dress_women_dress__2_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (66, 'Intricate Lace Trumpet Gown', 'A body-hugging trumpet-style wedding dress showcasing intricate micro-textured lace details, an open back, and long lace train.', 410.00, 1, '/images/wedding_dress_women_dress__3_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (67, 'Grand Sweetheart Tulle Ballgown', 'A fairytale princess wedding ballgown featuring layers of sparkling tulle, hand-detailed crystal beads, and a sweetheart neckline.', 360.00, 1, '/images/wedding_dress_women_dress__4_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (68, 'Minimalist Off-Shoulder Crepe Gown', 'A sleek, modern off-shoulder wedding dress crafted in heavy crepe silk with a clean minimalist silhouette and buttons down the back.', 440.00, 1, '/images/wedding_dress_women_dress__5_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (69, 'Boho V-Neck Lace Wedding Gown', 'A bohemian-inspired lace wedding dress featuring flowing bell sleeves, a deep V-neck, and delicate scallop lace borders.', 320.00, 1, '/images/wedding_dress_women_dress__6_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (70, 'Royal Ivory Reception Anarkali Gown', 'A premium ivory georgette flared Anarkali dress featuring intricate silver thread embroidery, ideal for high-end wedding receptions.', 490.00, 1, '/images/wedding_dress_women_dress__7_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (71, 'Ivory Satin Pearl Stiletto Heels', 'Stunning ivory satin stiletto pumps decorated with hand-sewn pearl clusters and delicate floral embellishments on the toe strap.', 190.00, 6, '/images/women_wedding_shoe_shoe__1_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (72, 'Embroidered Lace Block Heel Sandals', 'Comfortable block heel wedding sandals crafted in sheer white floral lace, featuring a supportive ankle strap and block heel.', 210.00, 6, '/images/women_wedding_shoe_shoe__2_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (73, 'Sparkling Crystal Pointed Toe Heels', 'Luxury pointed toe stiletto heels covered in sparkling silver crystals that catch the light, offering a fairytale bridal look.', 210.00, 6, '/images/women_wedding_shoe_shoe__3_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (74, 'Princess Pearl Embellished Heels', 'Fairytale stiletto heels featuring a sheer mesh upper decorated with delicate pearls and a trailing pearl anklet wrap.', 170.00, 6, '/images/women_wedding_shoe_shoe__4_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (75, 'Embroidered Velvet Bridal Juttis', 'Traditional South Asian bridal juttis in deep red velvet, heavily embroidered with gold zari threads and tiny pearl beads.', 160.00, 6, '/images/women_wedding_shoe_shoe__5_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (76, 'Pastel Pink Lace Block Heels', 'Elegant wedding block heels in soft pastel pink leather, overlayed with white embroidered lace and a satin bow.', 160.00, 6, '/images/women_wedding_shoe_shoe__6_.jpg');

INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) 
VALUES (77, 'Ivory Lace Pointed Toe Pumps', 'Classic pointed toe bridal pumps overlayed with sheer white floral lace and finished with a comfortable mid-height stiletto heel.', 200.00, 6, '/images/women_wedding_shoe_shoe__7_.jpg');



-- ----------------------------------------------------
-- Seed Product Sizes & Stocks
-- ----------------------------------------------------
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (1, 'S', 5), (1, 'M', 10), (1, 'L', 8), (1, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (2, 'S', 5), (2, 'M', 10), (2, 'L', 8), (2, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (3, 'S', 5), (3, 'M', 10), (3, 'L', 8), (3, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (4, 'S', 5), (4, 'M', 10), (4, 'L', 8), (4, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (5, 'S', 5), (5, 'M', 10), (5, 'L', 8), (5, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (6, 'S', 5), (6, 'M', 10), (6, 'L', 8), (6, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (7, 'S', 5), (7, 'M', 10), (7, 'L', 8), (7, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (8, 'S', 5), (8, 'M', 10), (8, 'L', 8), (8, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (9, 'S', 5), (9, 'M', 10), (9, 'L', 8), (9, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (10, 'S', 5), (10, 'M', 10), (10, 'L', 8), (10, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (11, 'S', 5), (11, 'M', 10), (11, 'L', 8), (11, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (12, 'S', 5), (12, 'M', 10), (12, 'L', 8), (12, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (13, 'S', 5), (13, 'M', 10), (13, 'L', 8), (13, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (14, 'S', 5), (14, 'M', 10), (14, 'L', 8), (14, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (15, 'S', 5), (15, 'M', 10), (15, 'L', 8), (15, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (16, 'S', 5), (16, 'M', 10), (16, 'L', 8), (16, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (17, 'S', 5), (17, 'M', 10), (17, 'L', 8), (17, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (18, 'S', 5), (18, 'M', 10), (18, 'L', 8), (18, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (19, 'S', 5), (19, 'M', 10), (19, 'L', 8), (19, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (20, 'S', 5), (20, 'M', 10), (20, 'L', 8), (20, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (21, 'S', 5), (21, 'M', 10), (21, 'L', 8), (21, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (22, 'S', 5), (22, 'M', 10), (22, 'L', 8), (22, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (23, 'S', 5), (23, 'M', 10), (23, 'L', 8), (23, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (24, 'S', 5), (24, 'M', 10), (24, 'L', 8), (24, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (25, 'S', 5), (25, 'M', 10), (25, 'L', 8), (25, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (26, 'S', 5), (26, 'M', 10), (26, 'L', 8), (26, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (27, 'S', 5), (27, 'M', 10), (27, 'L', 8), (27, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (28, 'S', 5), (28, 'M', 10), (28, 'L', 8), (28, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (29, 'S', 5), (29, 'M', 10), (29, 'L', 8), (29, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (30, 'S', 5), (30, 'M', 10), (30, 'L', 8), (30, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (31, 'S', 5), (31, 'M', 10), (31, 'L', 8), (31, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (32, 'S', 5), (32, 'M', 10), (32, 'L', 8), (32, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (33, 'S', 5), (33, 'M', 10), (33, 'L', 8), (33, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (34, 'One Size', 15);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (35, 'One Size', 15);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (36, 'One Size', 15);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (37, 'One Size', 15);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (38, 'One Size', 15);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (39, 'One Size', 15);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (40, 'One Size', 15);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (41, 'One Size', 15);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (42, 'One Size', 15);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (43, 'One Size', 15);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (44, 'One Size', 15);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (45, 'One Size', 15);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (46, 'One Size', 15);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (47, 'One Size', 15);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (48, 'One Size', 15);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (49, 'US 6', 5), (49, 'US 7', 8), (49, 'US 8', 6), (49, 'US 9', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (50, 'One Size', 15);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (51, 'One Size', 15);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (52, 'One Size', 15);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (53, 'One Size', 15);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (54, 'One Size', 15);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (55, 'One Size', 15);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (56, 'One Size', 15);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (57, 'One Size', 15);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (58, 'S', 5), (58, 'M', 10), (58, 'L', 8), (58, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (59, 'S', 5), (59, 'M', 10), (59, 'L', 8), (59, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (60, 'S', 5), (60, 'M', 10), (60, 'L', 8), (60, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (61, 'S', 5), (61, 'M', 10), (61, 'L', 8), (61, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (62, 'S', 5), (62, 'M', 10), (62, 'L', 8), (62, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (63, 'S', 5), (63, 'M', 10), (63, 'L', 8), (63, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (64, 'S', 5), (64, 'M', 10), (64, 'L', 8), (64, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (65, 'S', 5), (65, 'M', 10), (65, 'L', 8), (65, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (66, 'S', 5), (66, 'M', 10), (66, 'L', 8), (66, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (67, 'S', 5), (67, 'M', 10), (67, 'L', 8), (67, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (68, 'S', 5), (68, 'M', 10), (68, 'L', 8), (68, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (69, 'S', 5), (69, 'M', 10), (69, 'L', 8), (69, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (70, 'S', 5), (70, 'M', 10), (70, 'L', 8), (70, 'XL', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (71, 'US 6', 5), (71, 'US 7', 8), (71, 'US 8', 6), (71, 'US 9', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (72, 'US 6', 5), (72, 'US 7', 8), (72, 'US 8', 6), (72, 'US 9', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (73, 'US 6', 5), (73, 'US 7', 8), (73, 'US 8', 6), (73, 'US 9', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (74, 'US 6', 5), (74, 'US 7', 8), (74, 'US 8', 6), (74, 'US 9', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (75, 'US 6', 5), (75, 'US 7', 8), (75, 'US 8', 6), (75, 'US 9', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (76, 'US 6', 5), (76, 'US 7', 8), (76, 'US 8', 6), (76, 'US 9', 4);
INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (77, 'US 6', 5), (77, 'US 7', 8), (77, 'US 8', 6), (77, 'US 9', 4);


-- ----------------------------------------------------
-- Seed Default Admin User
-- ----------------------------------------------------
-- Credentials: mrkaif1309@gmail.com / Mohammed@admin09
INSERT INTO users (name, email, password_hash, role)
VALUES ('Amira Admin', 'mrkaif1309@gmail.com', '$2a$10$/ZT.mb0jq0Apai8Ae0erY.awGervxQq.6w2DUR/xNq4ZetUWdL5Ti', 'admin');
