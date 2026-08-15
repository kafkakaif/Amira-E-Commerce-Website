const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\HP\\.gemini\\antigravity\\scratch\\amira\\images';
const destDir = 'C:\\Users\\HP\\.gemini\\antigravity\\scratch\\amira\\public\\images';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

if (!fs.existsSync(srcDir)) {
  console.error('Source images directory not found at ' + srcDir);
  process.exit(1);
}

// ----------------------------------------------------
// PRODUCT DICTIONARY (76 UNIQUE ITEMS)
// ----------------------------------------------------
const catalogDict = {
  // Traditional - Arab Abayas
  'abaya/abaya (1).jpg': {
    name: 'Champagne Satin Bridal Abaya Set',
    category: 'Traditional - Arab',
    description: 'Luxurious champagne-gold satin abaya featuring a matching fluid satin inner slip dress and silk chiffon hijab, detailed with hand-embroidered floral sleeve cuffs.'
  },
  'abaya/abaya (2).jpg': {
    name: 'Saudi Gold Shimmer Party Abaya',
    category: 'Traditional - Arab',
    description: 'Saudi-style pure white party wear abaya woven with metallic gold shimmer threads, offering a flowing silhouette and matching gold-lace embellished borders.'
  },
  'abaya/abaya (3).jpg': {
    name: 'Golden Branch Moon Silk Abaya',
    category: 'Traditional - Arab',
    description: 'Traditional Dubai abaya in deep olive brown silk crepe, featuring intricate golden tree branch embroidery along the sleeves and crescent hemline.'
  },

  // Combo Couples Matching Attire
  'combo/dress (1).jpg': {
    name: 'Mermaid Gown & Beige Groom Tuxedo Set',
    category: 'Dresses - Women', // Will go under Dresses - Women
    description: 'A premium wedding reception couple set featuring a white crepe silk mermaid gown with a glittering sequined cape overlay, paired with a slim-fit beige groom tuxedo.'
  },
  'combo/dress (2).jpg': {
    name: 'Midnight Embellished Hijabi Bridal Gown Set',
    category: 'Traditional - Arab', // Fits modern Arab couple look
    description: 'An exquisite modern Arab couple set including a fitted black bridal gown with dense sequin lace work, a matching silk hijab, and a classic black three-piece groom suit.'
  },
  'combo/dress (3).jpg': {
    name: 'Ivory Walima Anarkali & Sherwani Set',
    category: 'Traditional - Indian',
    description: 'A traditional South Asian walima couple outfit set showcasing an ivory flared Anarkali gown with gold zari threadwork, paired with a matching structured silk sherwani.'
  },
  'combo/dress (4).jpg': {
    name: 'Royal Maroon Lehenga & Sherwani Couple Suit',
    category: 'Traditional - Indian',
    description: 'A premium deep maroon velvet couple set featuring a heavily embroidered bridal lehenga choli and a matching raw silk groom sherwani with antique gold borders.'
  },
  'combo/dress (5).jpg': {
    name: 'Sage Green Banarasi Silk Couple Set',
    category: 'Traditional - Indian',
    description: 'A coordinated South Asian ethnic couple outfit set in soft sage green Banarasi silk, detailed with matching woven floral prints and gold threadwork.'
  },

  // Traditional - Indian Men's
  'indian men wedding dress/dress (1).jpg': {
    name: 'Gold Brocade Silk Sherwani',
    category: 'Traditional - Indian',
    description: 'A structured groom sherwani crafted in royal gold brocade silk, detailed with hand-tailored bandhgala collar buttons and a matching beige churidar.'
  },
  'indian men wedding dress/dress (2).jpg': {
    name: 'Ivory Lucknowi Chikankari Sherwani',
    category: 'Traditional - Indian',
    description: 'A refined ivory wedding sherwani featuring detailed Lucknowi Chikankari floral embroidery on handloom silk, complete with gold buttons.'
  },
  'indian men wedding dress/dress (3).jpg': {
    name: 'Traditional Crimson Velvet Sherwani',
    category: 'Traditional - Indian',
    description: 'Deep crimson red velvet groom sherwani embellished with intricate zari embroidery along the cuffs and collar, perfect for traditional Indian weddings.'
  },
  'indian men wedding dress/dress (4).jpg': {
    name: 'Classic Black Bandhgala Silk Kurta Set',
    category: 'Traditional - Indian',
    description: 'A sleek black Banarasi silk bandhgala kurta set featuring a structured collar, matching trouser pajama, and handloom embroidery details.'
  },

  // Traditional - Indian Women's
  'indian wedding dress women/dress (1).jpg': {
    name: 'Ivory Embroidered Walima Anarkali Gown',
    category: 'Traditional - Indian',
    description: 'Flared ivory white Anarkali bridal gown with sheer georgette sleeves and hand-embroidered silver dabka and zari floral motifs.'
  },
  'indian wedding dress women/dress (2).jpg': {
    name: 'Royal Maroon Embroidered Lehenga Choli',
    category: 'Traditional - Indian',
    description: 'Deep maroon velvet bridal lehenga choli set decorated with dense gold threadwork, semi-precious bead embellishments, and a net dupatta.'
  },
  'indian wedding dress women/dress (3).jpg': {
    name: 'Blush Pink Silk Lehenga Set',
    category: 'Traditional - Indian',
    description: 'Bespoke blush pink raw silk bridal lehenga with mint green border highlights, hand-tailored with detailed floral embroidery and sequin lines.'
  },
  'indian wedding dress women/dress (4).jpg': {
    name: 'Teal Banarasi Silk Saree',
    category: 'Traditional - Indian',
    description: 'A luxury teal-colored Banarasi silk saree featuring handwoven golden zari floral borders, matching pallu details, and a raw silk blouse.'
  },
  'indian wedding dress women/dress (5).jpg': {
    name: 'Deep Crimson Zardozi Lehenga',
    category: 'Traditional - Indian',
    description: 'A traditional deep crimson red bridal lehenga heavily adorned with zardozi embroidery, dabka work, and semi-precious stone beadings.'
  },
  'indian wedding dress women/dress (6).jpg': {
    name: 'Pastel Mint Green Wedding Lehenga',
    category: 'Traditional - Indian',
    description: 'A modern pastel mint green organza lehenga choli set featuring mirror work, pink floral embroidery, and a matching sheer dupatta.'
  },
  'indian wedding dress women/dress (7).jpg': {
    name: 'Sage Green Embroidered Silk Saree',
    category: 'Traditional - Indian',
    description: 'Elegant sage green georgette saree featuring intricate handloom embroidery along the borders, completed with a matching silk blouse.'
  },
  'indian wedding dress women/dress (8).jpg': {
    name: 'Deep Ruby Velvet Bridal Lehenga',
    category: 'Traditional - Indian',
    description: 'A stunning deep ruby red velvet bridal lehenga featuring royal peacock motif embroideries, gold threadwork, and double dupatta styling.'
  },

  // Traditional - Japan: Japan Traditional Men's
  'Japan men dress/dress (1).jpg': {
    name: 'Classic Black Wedding Montsuki Hakama',
    category: 'Traditional - Japan',
    description: 'Traditional Japanese groom wedding attire featuring a black silk kimono jacket with five family crests, pleated grey hakama trousers, and a white obi sash.'
  },
  'Japan men dress/dress (2).jpg': {
    name: 'Navy Silk Hakama Kimono Set',
    category: 'Traditional - Japan',
    description: 'A formal navy blue silk kimono paired with striped grey hakama trousers and a matching haori jacket, tailored for traditional Japanese ceremonies.'
  },
  'Japan men dress/dress (3).jpg': {
    name: 'Grey Pinstripe Groom Hakama',
    category: 'Traditional - Japan',
    description: 'Traditional Japanese pinstriped grey silk hakama trousers paired with a structured black kimono jacket and matching white cord ties.'
  },
  'Japan men dress/dress (4).jpg': {
    name: 'Embroidered Crane Haori Kimono',
    category: 'Traditional - Japan',
    description: 'A luxurious deep navy blue haori jacket featuring hand-embroidered white cranes on the back, representing longevity, paired with matching hakama trousers.'
  },
  'Japan men dress/dress (5).jpg': {
    name: 'White Satin Wedding Montsuki Hakama',
    category: 'Traditional - Japan',
    description: 'An elegant pure white silk montsuki kimono jacket with family crests, paired with textured grey and silver pleated hakama trousers.'
  },
  'Japan men dress/dress (6).jpg': {
    name: 'Charcoal Silk Groom Kimono Set',
    category: 'Traditional - Japan',
    description: 'Traditional Japanese wedding kimono set in textured charcoal silk, complete with a structured haori coat and white tie details.'
  },
  'Japan men dress/dress (7).jpg': {
    name: 'Forest Green Haori & Hakama Suit',
    category: 'Traditional - Japan',
    description: 'A custom forest green silk haori jacket paired with classic striped hakama trousers, offering a colorful traditional Japanese groom look.'
  },

  // Traditional - Japan: Japan Traditional Women's
  'japan women dress/dress (1).jpg': {
    name: 'White Silk Uchikake Bridal Kimono',
    category: 'Traditional - Japan',
    description: 'A premium pure white silk Uchikake bridal kimono featuring embossed floral crane patterns and a heavily padded red hemline.'
  },
  'japan women dress/dress (2).jpg': {
    name: 'Scarlet Crane Uchikake Kimono',
    category: 'Traditional - Japan',
    description: 'Traditional scarlet red Japanese bridal Uchikake kimono decorated with gold foil details and hand-embroidered flying crane patterns.'
  },
  'japan women dress/dress (3).jpg': {
    name: 'Pink Floral Furisode Kimono',
    category: 'Traditional - Japan',
    description: 'A modern pastel pink silk Furisode kimono featuring long flowing sleeves and printed cherry blossom and peony patterns, tailored for bridal banquets.'
  },
  'japan women dress/dress (4).jpg': {
    name: 'Golden Brocade Uchikake Kimono',
    category: 'Traditional - Japan',
    description: 'A luxurious Japanese bridal kimono woven in heavy golden brocade silk, depicting pine forests and traditional fans in multi-colored silk threads.'
  },
  'japan women dress/dress (5).jpg': {
    name: 'Lavender Silk Bridal Furisode',
    category: 'Traditional - Japan',
    description: 'A premium lavender purple silk Furisode kimono featuring hand-painted floral bouquets along the hemline and sleeves, finished with a silver obi.'
  },
  'japan women dress/dress (6).jpg': {
    name: 'Emerald Silk Uchikake Wedding Gown',
    category: 'Traditional - Japan',
    description: 'Stunning emerald green Japanese wedding kimono featuring gold embroidery, cherry blossoms, and classic crane prints, heavily padded at the base.'
  },

  // Shoes & Jewellery: Jewellery
  'jewellary/jewellery (1).jpg': {
    name: 'Royal Indian Kundan Choker Set',
    category: 'Shoes & Jewellery',
    description: 'A magnificent royal choker necklace set featuring multi-layered Kundan stones, raw emerald hangings, and matching teardrop earrings.'
  },
  'jewellary/jewellery (2).jpg': {
    name: 'Minimalist Pearl Choker Set',
    category: 'Shoes & Jewellery',
    description: 'A delicate bridal choker set featuring pure white freshwater pearls linked by a minimalist gold chain, complete with matching stud earrings.'
  },
  'jewellary/jewellery (3).jpg': {
    name: 'Classic Diamond Teardrop Necklace',
    category: 'Shoes & Jewellery',
    description: 'A sparkling diamond choker necklace featuring a central teardrop-cut cubic zirconia pendant, paired with matching hanging earrings.'
  },
  'jewellary/jewellery (4).jpg': {
    name: 'Emerald Cut Bridal Necklace Set',
    category: 'Shoes & Jewellery',
    description: 'Intricate silver-plated necklace adorned with square emerald-cut green gemstones, completed with drop earrings and a matching bracelet.'
  },
  'jewellary/jewellery (5).jpg': {
    name: 'Gold Filigree Bridal Choker Set',
    category: 'Shoes & Jewellery',
    description: 'An intricate traditional gold filigree choker set featuring detailed leaf engravings, micro bead lines, and hanging teardrop earrings.'
  },
  'jewellary/jewellery (6).jpg': {
    name: 'Pastel Floral Pearl Jewellery Set',
    category: 'Shoes & Jewellery',
    description: 'A modern bridal jewellery set in rose gold, featuring pastel pink flower motifs, freshwater pearls, and cubic zirconia stones.'
  },
  'jewellary/jewellery (7).jpg': {
    name: 'Rose Gold Crystal Flower Set',
    category: 'Shoes & Jewellery',
    description: 'A delicate rose gold jewellery set featuring crystal-studded flower pendants, a dainty chain necklace, and matching hook earrings.'
  },
  'jewellary/jewellery (8).jpg': {
    name: 'Multi-Row Pearl Necklace Set',
    category: 'Shoes & Jewellery',
    description: 'A classic bridal set featuring a three-row pearl strand necklace with a central diamond brooch clasp, matching drop earrings.'
  },
  'jewellary/jewellery (9).jpg': {
    name: 'Burgundy Velvet Teardrop Jewelry Set',
    category: 'Shoes & Jewellery',
    description: 'A dramatic bridal jewelry set featuring burgundy red teardrop crystals set in antique gold, complete with matching earrings.'
  },
  'jewellary/jewellery (10).jpg': {
    name: 'Korean Gold Floral Jewelry Set',
    category: 'Shoes & Jewellery',
    description: 'A minimalist gold necklace and earrings set featuring Korean-inspired gold floral shapes with tiny pearl centers.'
  },
  'jewellary/jewellery (11).jpg': {
    name: 'Pastel Tulip Gemstone Bracelet',
    category: 'Shoes & Jewellery',
    description: 'A dainty gold leaf bracelet decorated with pastel-colored gemstone tulips, perfect for spring weddings and bridesmaid gifts.'
  },

  // Shoes & Jewellery: Rings
  'rings/Rings (1).jpg': {
    name: 'Diamond Solitaire Halo Engagement Ring',
    category: 'Shoes & Jewellery',
    description: 'A timeless platinum engagement ring featuring a brilliant-cut diamond solitaire surrounded by a delicate pavé halo band.'
  },
  'rings/Rings (2).jpg': {
    name: 'Emerald Cut Diamond Ring Set',
    category: 'Shoes & Jewellery',
    description: 'A premium 18k white gold ring set featuring an emerald-cut central diamond, flanked by tapered baguette stones.'
  },
  'rings/Rings (3).jpg': {
    name: 'Vintage Rose Gold Floral Band',
    category: 'Shoes & Jewellery',
    description: 'A romantic rose gold wedding band engraved with vintage floral filigree and set with tiny brilliant-cut diamonds.'
  },
  'rings/Rings (4).jpg': {
    name: 'Sapphire Pear Drop Promise Ring',
    category: 'Shoes & Jewellery',
    description: 'A dainty white gold promise ring featuring a pear-shaped royal blue sapphire, accented by tiny diamond side leaves.'
  },
  'rings/Rings (5).jpg': {
    name: 'Classic Gold Infinity Wedding Band',
    category: 'Shoes & Jewellery',
    description: 'A solid 18k yellow gold wedding band featuring a modern infinity twist design, polished to a high mirror shine.'
  },
  'rings/Rings (6).jpg': {
    name: 'Marquise Cut Eternity Ring',
    category: 'Shoes & Jewellery',
    description: 'An elegant eternity ring band set with marquise-cut sparkling diamonds in a modern claw setting.'
  },
  'rings/Rings (7).jpg': {
    name: 'Oval Morganite Bridal Ring',
    category: 'Shoes & Jewellery',
    description: 'A stunning rose gold ring featuring a central oval-cut pink morganite stone, surrounded by a double diamond halo.'
  },
  'rings/Rings (8).jpg': {
    name: 'Trillion Cut Amethyst Engagement Ring',
    category: 'Shoes & Jewellery',
    description: 'Bespoke platinum engagement ring showcasing a trillion-cut purple amethyst stone, accented by diamond pavé shoulders.'
  },

  // Shoes & Jewellery: Men's Shoes
  'men wedding shoe/shoe (1).jpg': {
    name: 'Polished Black Patent Leather Oxfords',
    category: 'Shoes & Jewellery',
    description: 'Timeless black patent leather oxford dress shoes, featuring a sleek cap toe design, waxed laces, and leather soles for formal weddings.'
  },
  'men wedding shoe/shoe (2).jpg': {
    name: 'Refined Tan Suede Loafers',
    category: 'Shoes & Jewellery',
    description: 'Elegant tan suede slip-on loafers, detailed with a gold-tone horsebit buckle, perfect for modern groom beach or reception wear.'
  },
  'men wedding shoe/shoe (3).jpg': {
    name: 'Classic Brown Leather Brogues',
    category: 'Shoes & Jewellery',
    description: 'Traditional wingtip brown leather brogues, featuring detailed perforated wingtip patterns and a dark wood stacked heel.'
  },
  'men wedding shoe/shoe (4).jpg': {
    name: 'Cream Linen Slip-On Loafers',
    category: 'Shoes & Jewellery',
    description: 'Minimalist cream-colored linen slip-on loafers, offering a relaxed yet refined option for summer and destination weddings.'
  },
  'men wedding shoe/shoe (5).jpg': {
    name: 'Refined Beige Dress Shoes',
    category: 'Shoes & Jewellery',
    description: 'Modern beige leather dress shoes featuring a clean plain-toe silhouette, double stitching, and a comfortable leather lining.'
  },

  // Shoes & Jewellery: Women's Shoes
  'women wedding shoe/shoe (1).jpg': {
    name: 'Ivory Satin Pearl Stiletto Heels',
    category: 'Shoes & Jewellery',
    description: 'Stunning ivory satin stiletto pumps decorated with hand-sewn pearl clusters and delicate floral embellishments on the toe strap.'
  },
  'women wedding shoe/shoe (2).jpg': {
    name: 'Embroidered Lace Block Heel Sandals',
    category: 'Shoes & Jewellery',
    description: 'Comfortable block heel wedding sandals crafted in sheer white floral lace, featuring a supportive ankle strap and block heel.'
  },
  'women wedding shoe/shoe (3).jpg': {
    name: 'Sparkling Crystal Pointed Toe Heels',
    category: 'Shoes & Jewellery',
    description: 'Luxury pointed toe stiletto heels covered in sparkling silver crystals that catch the light, offering a fairytale bridal look.'
  },
  'women wedding shoe/shoe (4).jpg': {
    name: 'Princess Pearl Embellished Heels',
    category: 'Shoes & Jewellery',
    description: 'Fairytale stiletto heels featuring a sheer mesh upper decorated with delicate pearls and a trailing pearl anklet wrap.'
  },
  'women wedding shoe/shoe (5).jpg': {
    name: 'Embroidered Velvet Bridal Juttis',
    category: 'Shoes & Jewellery',
    description: 'Traditional South Asian bridal juttis in deep red velvet, heavily embroidered with gold zari threads and tiny pearl beads.'
  },
  'women wedding shoe/shoe (6).jpg': {
    name: 'Pastel Pink Lace Block Heels',
    category: 'Shoes & Jewellery',
    description: 'Elegant wedding block heels in soft pastel pink leather, overlayed with white embroidered lace and a satin bow.'
  },
  'women wedding shoe/shoe (7).jpg': {
    name: 'Ivory Lace Pointed Toe Pumps',
    category: 'Shoes & Jewellery',
    description: 'Classic pointed toe bridal pumps overlayed with sheer white floral lace and finished with a comfortable mid-height stiletto heel.'
  },

  // Dresses - Men: Wedding Suits
  'wedding dress men/dress (1).jpg': {
    name: 'Royal Navy Double-Breasted Pinstripe Suit',
    category: 'Dresses - Men',
    description: 'A premium navy blue wool double-breasted suit featuring white pinstripes, peak lapels, gold buttons, and white tailored trousers.'
  },
  'wedding dress men/dress (2).jpg': {
    name: 'Classic Black Shawl Tuxedo',
    category: 'Dresses - Men',
    description: 'A formal black groom tuxedo jacket featuring satin shawl lapels, a single button closure, and matching satin-stripe trousers.'
  },
  'wedding dress men/dress (3).jpg': {
    name: 'Old Money Beige Tailored Suit',
    category: 'Dresses - Men',
    description: 'A refined beige wool-blend groom suit in old money style, featuring a structured jacket, white shirt, and matching beige trousers.'
  },
  'wedding dress men/dress (4).jpg': {
    name: 'Beige Silk Tie Groom Set',
    category: 'Dresses - Men',
    description: 'A modern groom wedding blazer set in sand beige, complete with a brown silk tie, gold tie clip, and white pocket square.'
  },
  'wedding dress men/dress (5).jpg': {
    name: 'Modern Sage Green Wedding Suit',
    category: 'Dresses - Men',
    description: 'An elegant sage green two-piece suit set featuring a modern cut, matching vest, white dress shirt, and sauge trousers.'
  },
  'wedding dress men/dress (6).jpg': {
    name: 'Ivory Frock Coat Tailcoat Suit',
    category: 'Dresses - Men',
    description: 'A luxurious ivory white frock coat tailcoat suit with historical flared overcoat lines, tailored for royal and classic weddings.'
  },

  // Dresses - Women: Wedding Dresses
  'wedding dress women/dress (1).jpg': {
    name: 'Elegant Long Sleeve Floral Lace Gown',
    category: 'Dresses - Women',
    description: 'A romantic white bridal gown featuring detailed sheer floral lace overlays on the bodice, long sleeves, and a flowing tulle skirt.'
  },
  'wedding dress women/dress (2).jpg': {
    name: 'Classic Ivory Silk A-Line Dress',
    category: 'Dresses - Women',
    description: 'An elegant, timeless A-line wedding dress made of heavy ivory silk satin, featuring a structured strapless bodice and long train.'
  },
  'wedding dress women/dress (3).jpg': {
    name: 'Intricate Lace Trumpet Gown',
    category: 'Dresses - Women',
    description: 'A body-hugging trumpet-style wedding dress showcasing intricate micro-textured lace details, an open back, and long lace train.'
  },
  'wedding dress women/dress (4).jpg': {
    name: 'Grand Sweetheart Tulle Ballgown',
    category: 'Dresses - Women',
    description: 'A fairytale princess wedding ballgown featuring layers of sparkling tulle, hand-detailed crystal beads, and a sweetheart neckline.'
  },
  'wedding dress women/dress (5).jpg': {
    name: 'Minimalist Off-Shoulder Crepe Gown',
    category: 'Dresses - Women',
    description: 'A sleek, modern off-shoulder wedding dress crafted in heavy crepe silk with a clean minimalist silhouette and buttons down the back.'
  },
  'wedding dress women/dress (6).jpg': {
    name: 'Boho V-Neck Lace Wedding Gown',
    category: 'Dresses - Women',
    description: 'A bohemian-inspired lace wedding dress featuring flowing bell sleeves, a deep V-neck, and delicate scallop lace borders.'
  },
  'wedding dress women/dress (7).jpg': {
    name: 'Royal Ivory Reception Anarkali Gown',
    category: 'Dresses - Women',
    description: 'A premium ivory georgette flared Anarkali dress featuring intricate silver thread embroidery, ideal for high-end wedding receptions.'
  }
};

const catToId = {
  'Dresses - Women': 1,
  'Dresses - Men': 2,
  'Traditional - Indian': 3,
  'Traditional - Arab': 4,
  'Traditional - Japan': 5,
  'Shoes & Jewellery': 6
};

// ----------------------------------------------------
// PROCESS & CLASSIFICATION LOGIC
// ----------------------------------------------------
const products = [];

// Helper: Sanitize destination filename
function sanitizeFilename(subDir, originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const base = subDir.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const itemBase = originalName.substring(0, originalName.lastIndexOf('.')).replace(/[^a-z0-9]/gi, '_').toLowerCase();
  return `${base}_${itemBase}${ext}`;
}

// Helper: Generate price
function getPrice(category, name) {
  const lower = name.toLowerCase();
  if (category === 'Shoes & Jewellery') {
    if (/shoe|heel|sandal|pump|stiletto|juttis/i.test(lower)) {
      return (140 + (Math.floor(Math.random() * 8) * 10)).toFixed(2); // $140 - $210
    }
    return (90 + (Math.floor(Math.random() * 12) * 10)).toFixed(2); // $90 - $200
  }
  return (320 + (Math.floor(Math.random() * 26) * 10)).toFixed(2); // $320 - $570
}

let fileCount = 0;
let matchCount = 0;

function traverse(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverse(fullPath);
    } else {
      const ext = path.extname(item).toLowerCase();
      if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
        fileCount++;
        
        // Find relative path for key
        const relPath = path.relative(srcDir, fullPath).replace(/\\/g, '/');
        
        // Lookup in dictionary
        const entry = catalogDict[relPath];
        if (entry) {
          matchCount++;
          const cleanName = sanitizeFilename(path.dirname(relPath), item);
          const destPath = path.join(destDir, cleanName);
          
          // Copy image
          fs.copyFileSync(fullPath, destPath);
          
          const price = getPrice(entry.category, item);
          const imageUrl = `/images/${cleanName}`;
          
          products.push({
            id: matchCount, // sequential ID
            name: entry.name,
            category: entry.category,
            category_id: catToId[entry.category],
            description: entry.description,
            price: price,
            image_url: imageUrl,
            relPath: relPath
          });
        } else {
          console.warn(`Warning: file not in dictionary: ${relPath}`);
        }
      }
    }
  });
}

traverse(srcDir);
console.log(`Scan complete. Found ${fileCount} images. Mapped ${matchCount} products.`);

// Build SQL product inserts and size inserts
let productSeeds = '';
let sizeSeeds = '';

products.forEach(p => {
  productSeeds += `INSERT OR IGNORE INTO products (id, name, description, price, category_id, image_url) \nVALUES (${p.id}, '${p.name.replace(/'/g, "''")}', '${p.description.replace(/'/g, "''")}', ${p.price}, ${p.category_id}, '${p.image_url}');\n\n`;
  
  // Sizing distributions
  if (p.category === 'Shoes & Jewellery') {
    const lowerName = p.name.toLowerCase();
    if (/shoe|heel|sandal|pump|stiletto|juttis/i.test(lowerName)) {
      // Shoe sizes
      sizeSeeds += `INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (${p.id}, 'US 6', 5), (${p.id}, 'US 7', 8), (${p.id}, 'US 8', 6), (${p.id}, 'US 9', 4);\n`;
    } else {
      // Accessories
      sizeSeeds += `INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (${p.id}, 'One Size', 15);\n`;
    }
  } else {
    // Clothing sizes
    sizeSeeds += `INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (${p.id}, 'S', 5), (${p.id}, 'M', 10), (${p.id}, 'L', 8), (${p.id}, 'XL', 4);\n`;
  }
});

// Construct the schema.sql file content
const schemaContent = `-- Amira E-commerce Database Schema & Seed Data (Rev 5)

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
${productSeeds}

-- ----------------------------------------------------
-- Seed Product Sizes & Stocks
-- ----------------------------------------------------
${sizeSeeds}

-- ----------------------------------------------------
-- Seed Default Admin User
-- ----------------------------------------------------
-- Credentials: mrkaif1309@gmail.com / Mohammed@admin09
INSERT INTO users (name, email, password_hash, role)
VALUES ('Amira Admin', 'mrkaif1309@gmail.com', '$2a$10$/ZT.mb0jq0Apai8Ae0erY.awGervxQq.6w2DUR/xNq4ZetUWdL5Ti', 'admin');
`;

// Write to schema.sql
const schemaPath = 'C:\\Users\\HP\\.gemini\\antigravity\\scratch\\amira\\sql\\schema.sql';
fs.writeFileSync(schemaPath, schemaContent, 'utf8');

console.log(`Generated new schema.sql with ${products.length} products successfully.`);
process.exit(0);
