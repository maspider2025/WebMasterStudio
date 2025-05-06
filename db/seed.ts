import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import { hash } from "bcrypt";

async function seed() {
  try {
    console.log("🌱 Starting database seeding...");

    // Create demo user
    const hashedPassword = await hash("password123", 10);
    const existingUser = await db.query.users.findFirst({
      where: eq(schema.users.username, "demo"),
    });

    let userId;
    if (!existingUser) {
      console.log("Creating demo user...");
      const [user] = await db.insert(schema.users).values({
        username: "demo",
        password: hashedPassword,
        email: "demo@example.com",
        fullName: "Demo User",
      }).returning();
      userId = user.id;
      console.log(`Created user with ID: ${userId}`);
    } else {
      userId = existingUser.id;
      console.log(`Using existing user with ID: ${userId}`);
    }

    // Create template categories
    const templateCategories = ["landing", "ecommerce", "blog", "portfolio"];
    for (const category of templateCategories) {
      const existingTemplate = await db.query.templates.findFirst({
        where: eq(schema.templates.category, category),
      });

      if (!existingTemplate) {
        console.log(`Creating ${category} template...`);
        const [template] = await db.insert(schema.templates).values({
          name: `${category.charAt(0).toUpperCase() + category.slice(1)} Template`,
          description: `A beautiful ${category} template for your website.`,
          category,
          thumbnail: getTemplateThumbnail(category),
        }).returning();

        // Create template elements
        await createTemplateElements(template.id, category);
      } else {
        console.log(`Template category ${category} already exists.`);
      }
    }

    // Create a demo project
    const existingProject = await db.query.projects.findFirst({
      where: eq(schema.projects.name, "E-commerce Demo Store"),
    });

    let projectId;
    if (!existingProject) {
      console.log("Creating demo e-commerce project...");
      const [project] = await db.insert(schema.projects).values({
        userId,
        name: "E-commerce Demo Store",
        description: "A complete e-commerce store template with products, cart, and checkout",
        isPublic: true,
      }).returning();
      projectId = project.id;
      console.log(`Created project with ID: ${projectId}`);

      // Create product categories
      console.log("Creating product categories...");
      const categoryData = [
        {
          name: "Electronics",
          slug: "electronics",
          description: "Gadgets, devices, and electronic equipment",
          image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
          order: 1,
        },
        {
          name: "Clothing",
          slug: "clothing",
          description: "Fashion apparel and accessories",
          image: "https://images.unsplash.com/photo-1542060748-10c28b62716f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
          order: 2,
        },
        {
          name: "Home & Kitchen",
          slug: "home-kitchen",
          description: "Furniture, appliances, and home decor",
          image: "https://images.unsplash.com/photo-1584346133934-a3044f2a8507?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
          order: 3,
        }
      ];

      const categories = [];
      for (const category of categoryData) {
        const [newCategory] = await db.insert(schema.productCategories).values({
          projectId,
          ...category
        }).returning();
        categories.push(newCategory);
        console.log(`Created category: ${newCategory.name} with ID: ${newCategory.id}`);
      }

      // Create products
      console.log("Creating products...");
      const productsData = [
        {
          name: "Smartphone Pro Max",
          slug: "smartphone-pro-max",
          description: "Latest smartphone with advanced camera system and powerful processor. Features a high-resolution OLED display, all-day battery life, and water resistance.",
          price: "999.99",
          salePrice: "899.99",
          sku: "PHONE-001",
          status: "published",
          featured: true,
          inventory: 100,
          categoryId: categories[0].id, // Electronics
          images: JSON.stringify([
            { url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80", alt: "Smartphone Pro Max" },
            { url: "https://images.unsplash.com/photo-1592286927505-1def25115558?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80", alt: "Smartphone side view" }
          ]),
          attributes: JSON.stringify({
            color: "Midnight Black",
            storage: "256GB",
            screenSize: "6.7 inches"
          })
        },
        {
          name: "Wireless Noise-Cancelling Headphones",
          slug: "wireless-headphones",
          description: "Premium over-ear headphones with active noise cancellation, high-fidelity sound, and 30-hour battery life. Includes quick charge feature and touch controls.",
          price: "349.99",
          salePrice: "299.99",
          sku: "AUDIO-001",
          status: "published",
          featured: true,
          inventory: 50,
          categoryId: categories[0].id, // Electronics
          images: JSON.stringify([
            { url: "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80", alt: "Wireless Headphones" },
            { url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80", alt: "Headphones detail" }
          ]),
          attributes: JSON.stringify({
            color: "Silver",
            connectivity: "Bluetooth 5.0",
            batteryLife: "30 hours"
          })
        },
        {
          name: "Designer T-Shirt",
          slug: "designer-tshirt",
          description: "Premium cotton t-shirt with exclusive designer print. Comfortable fit and durable fabric that retains shape after washing.",
          price: "49.99",
          salePrice: null,
          sku: "CLOTH-001",
          status: "published",
          featured: false,
          inventory: 200,
          categoryId: categories[1].id, // Clothing
          images: JSON.stringify([
            { url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80", alt: "Designer T-Shirt" },
            { url: "https://images.unsplash.com/photo-1622445275576-721325763afe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80", alt: "T-Shirt detail" }
          ]),
          attributes: JSON.stringify({
            color: "White",
            size: "M",
            material: "100% Cotton"
          })
        },
        {
          name: "Smart Coffee Maker",
          slug: "smart-coffee-maker",
          description: "Programmable coffee maker with smartphone control. Schedule brewing times, adjust strength, and receive notifications when your coffee is ready.",
          price: "129.99",
          salePrice: "99.99",
          sku: "HOME-001",
          status: "published",
          featured: true,
          inventory: 30,
          categoryId: categories[2].id, // Home & Kitchen
          images: JSON.stringify([
            { url: "https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80", alt: "Smart Coffee Maker" },
            { url: "https://images.unsplash.com/photo-1510017803434-a899398421b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80", alt: "Coffee brewing" }
          ]),
          attributes: JSON.stringify({
            color: "Stainless Steel",
            capacity: "12 cups",
            connectivity: "Wi-Fi"
          })
        },
        {
          name: "Premium Laptop Backpack",
          slug: "laptop-backpack",
          description: "Water-resistant backpack with padded laptop compartment and multiple storage pockets. Ergonomic design for comfortable carrying with anti-theft features.",
          price: "79.99",
          salePrice: "69.99",
          sku: "BAG-001",
          status: "published",
          featured: false,
          inventory: 75,
          categoryId: categories[1].id, // Clothing (accessories)
          images: JSON.stringify([
            { url: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80", alt: "Laptop Backpack" },
            { url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80", alt: "Backpack interior" }
          ]),
          attributes: JSON.stringify({
            color: "Navy Blue",
            laptopSize: "Up to 15.6 inches",
            material: "Polyester"
          })
        },
        {
          name: "Digital Fitness Watch",
          slug: "fitness-watch",
          description: "Advanced fitness tracker with heart rate monitoring, GPS, and 20+ exercise modes. Features sleep tracking, smartphone notifications, and 7-day battery life.",
          price: "199.99",
          salePrice: "179.99",
          sku: "WEAR-001",
          status: "published",
          featured: true,
          inventory: 60,
          categoryId: categories[0].id, // Electronics
          images: JSON.stringify([
            { url: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80", alt: "Fitness Watch" },
            { url: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80", alt: "Watch on wrist" }
          ]),
          attributes: JSON.stringify({
            color: "Black",
            display: "AMOLED touchscreen",
            waterResistance: "50m"
          })
        }
      ];

      for (const productData of productsData) {
        const { categoryId, ...productInfo } = productData;
        const [product] = await db.insert(schema.products).values({
          projectId,
          ...productInfo
        }).returning();

        // Create product-category relation
        await db.insert(schema.productCategoryRelations).values({
          productId: product.id,
          categoryId: categoryId
        });

        console.log(`Created product: ${product.name} with ID: ${product.id}`);

        // Create product variants if needed
        if (product.name === "Designer T-Shirt") {
          const sizes = ["S", "M", "L", "XL"];
          const colors = ["White", "Black", "Blue", "Red"];
          
          for (const size of sizes) {
            for (const color of colors) {
              if (!(size === "M" && color === "White")) { // Skip the main product variant
                await db.insert(schema.productVariants).values({
                  productId: product.id,
                  name: `${product.name} - ${color}, ${size}`,
                  sku: `CLOTH-001-${color.substring(0, 1)}${size}`,
                  price: "49.99",
                  inventory: 20,
                  attributes: JSON.stringify({ size, color, material: "100% Cotton" })
                });
              }
            }
          }
          console.log(`Created variants for: ${product.name}`);
        }
      }
      
      // Create a homepage for the e-commerce store
      const [homePage] = await db.insert(schema.pages).values({
        projectId,
        name: "Home",
        slug: "home",
        isHomepage: true,
      }).returning();

      console.log(`Created home page with ID: ${homePage.id}`);

      // Create product page template
      const [productPage] = await db.insert(schema.pages).values({
        projectId,
        name: "Product",
        slug: "product",
        isHomepage: false,
      }).returning();

      console.log(`Created product page with ID: ${productPage.id}`);

      // Create cart page
      const [cartPage] = await db.insert(schema.pages).values({
        projectId,
        name: "Shopping Cart",
        slug: "cart",
        isHomepage: false,
      }).returning();

      console.log(`Created cart page with ID: ${cartPage.id}`);

      // Create checkout page
      const [checkoutPage] = await db.insert(schema.pages).values({
        projectId,
        name: "Checkout",
        slug: "checkout",
        isHomepage: false,
      }).returning();

      console.log(`Created checkout page with ID: ${checkoutPage.id}`);

      // Add elements to homepage
      await db.insert(schema.elements).values([
        {
          pageId: homePage.id,
          type: "container",
          name: "Header",
          x: 0,
          y: 0,
          width: 1200,
          height: 80,
          content: null,
          styles: JSON.stringify({
            backgroundColor: "#111827",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 2rem",
          }),
          zIndex: 1,
        },
        {
          pageId: homePage.id,
          type: "text",
          name: "Logo",
          x: 20,
          y: 25,
          width: 200,
          height: 30,
          content: "SHOP STORE",
          styles: JSON.stringify({
            color: "white",
            fontSize: "24px",
            fontWeight: "bold",
          }),
          zIndex: 2,
        },
        {
          pageId: homePage.id,
          type: "container",
          name: "Navigation",
          x: 500,
          y: 25,
          width: 400,
          height: 30,
          content: null,
          styles: JSON.stringify({
            display: "flex",
            gap: "2rem",
            alignItems: "center",
            justifyContent: "flex-end",
          }),
          zIndex: 2,
        },
        {
          pageId: homePage.id,
          type: "text",
          name: "Home Link",
          x: 500,
          y: 25,
          width: 80,
          height: 30,
          content: "Home",
          styles: JSON.stringify({
            color: "white",
            fontSize: "16px",
            cursor: "pointer",
          }),
          zIndex: 3,
        },
        {
          pageId: homePage.id,
          type: "text",
          name: "Products Link",
          x: 580,
          y: 25,
          width: 80,
          height: 30,
          content: "Products",
          styles: JSON.stringify({
            color: "white",
            fontSize: "16px",
            cursor: "pointer",
          }),
          zIndex: 3,
        },
        {
          pageId: homePage.id,
          type: "text",
          name: "Cart Link",
          x: 660,
          y: 25,
          width: 80,
          height: 30,
          content: "Cart (0)",
          styles: JSON.stringify({
            color: "white",
            fontSize: "16px",
            cursor: "pointer",
          }),
          zIndex: 3,
        },
        {
          pageId: homePage.id,
          type: "container",
          name: "Hero Section",
          x: 0,
          y: 80,
          width: 1200,
          height: 500,
          content: null,
          styles: JSON.stringify({
            backgroundColor: "#f3f4f6",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }),
          zIndex: 1,
        },
        {
          pageId: homePage.id,
          type: "heading",
          name: "Hero Title",
          x: 300,
          y: 200,
          width: 600,
          height: 60,
          content: "Shop the Latest Products",
          styles: JSON.stringify({
            fontSize: "48px",
            fontWeight: "bold",
            color: "white",
            textAlign: "center",
          }),
          zIndex: 2,
        },
        {
          pageId: homePage.id,
          type: "paragraph",
          name: "Hero Description",
          x: 350,
          y: 280,
          width: 500,
          height: 80,
          content: "Discover our curated collection of premium products at amazing prices.",
          styles: JSON.stringify({
            fontSize: "18px",
            color: "white",
            textAlign: "center",
          }),
          zIndex: 2,
        },
        {
          pageId: homePage.id,
          type: "button",
          name: "Shop Now Button",
          x: 500,
          y: 380,
          width: 200,
          height: 50,
          content: "Shop Now",
          styles: JSON.stringify({
            backgroundColor: "#f59e0b",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontWeight: "500",
            fontSize: "16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }),
          zIndex: 2,
        },
        {
          pageId: homePage.id,
          type: "container",
          name: "Featured Products Section",
          x: 0,
          y: 580,
          width: 1200,
          height: 600,
          content: null,
          styles: JSON.stringify({
            padding: "3rem 2rem",
            backgroundColor: "white",
          }),
          zIndex: 1,
        },
        {
          pageId: homePage.id,
          type: "heading",
          name: "Featured Products Title",
          x: 400,
          y: 600,
          width: 400,
          height: 50,
          content: "Featured Products",
          styles: JSON.stringify({
            fontSize: "36px",
            fontWeight: "bold",
            color: "#111827",
            textAlign: "center",
            marginBottom: "2rem",
          }),
          zIndex: 2,
        },
        {
          pageId: homePage.id,
          type: "productGallery",
          name: "Featured Products Gallery",
          x: 100,
          y: 670,
          width: 1000,
          height: 400,
          content: JSON.stringify({ filter: { featured: true }, limit: 3 }),
          styles: JSON.stringify({
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "2rem",
          }),
          zIndex: 2,
        },
        {
          pageId: homePage.id,
          type: "container",
          name: "Categories Section",
          x: 0,
          y: 1180,
          width: 1200,
          height: 500,
          content: null,
          styles: JSON.stringify({
            padding: "3rem 2rem",
            backgroundColor: "#f9fafb",
          }),
          zIndex: 1,
        },
        {
          pageId: homePage.id,
          type: "heading",
          name: "Categories Title",
          x: 400,
          y: 1200,
          width: 400,
          height: 50,
          content: "Shop by Category",
          styles: JSON.stringify({
            fontSize: "36px",
            fontWeight: "bold",
            color: "#111827",
            textAlign: "center",
            marginBottom: "2rem",
          }),
          zIndex: 2,
        },
      ]);

      console.log("Added elements to the homepage");
    } else {
      console.log("Demo e-commerce project already exists.");
      projectId = existingProject.id;
    }

    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during database seeding:", error);
  }
}

// Helper function to create template elements based on category
async function createTemplateElements(templateId: number, category: string) {
  // Basic structure for all templates
  const baseElements = [
    {
      templateId,
      type: "container",
      name: "Header",
      x: 0,
      y: 0,
      width: 1200,
      height: 80,
      content: null,
      styles: JSON.stringify({
        backgroundColor: "#3b82f6",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 2rem",
      }),
      zIndex: 1,
    },
    {
      templateId,
      type: "text",
      name: "Logo",
      x: 20,
      y: 25,
      width: 200,
      height: 30,
      content: "NextGen Site",
      styles: JSON.stringify({
        color: "white",
        fontSize: "24px",
        fontWeight: "bold",
      }),
      zIndex: 2,
    },
  ];

  let categorySpecificElements = [];

  // Add category-specific elements
  switch (category) {
    case "landing":
      categorySpecificElements = getLandingPageElements(templateId);
      break;
    case "ecommerce":
      categorySpecificElements = getEcommerceElements(templateId);
      break;
    case "blog":
      categorySpecificElements = getBlogElements(templateId);
      break;
    case "portfolio":
      categorySpecificElements = getPortfolioElements(templateId);
      break;
  }

  // Insert all elements
  await db.insert(schema.templateElements).values([...baseElements, ...categorySpecificElements]);
  console.log(`Created ${baseElements.length + categorySpecificElements.length} elements for ${category} template`);
}

// Helper function to get template thumbnail
function getTemplateThumbnail(category: string): string {
  switch (category) {
    case "landing":
      return "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80";
    case "ecommerce":
      return "https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80";
    case "blog":
      return "https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80";
    case "portfolio":
      return "https://images.unsplash.com/photo-1545665277-5937489579f2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80";
    default:
      return "https://images.unsplash.com/photo-1605379399642-870262d3d051?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80";
  }
}

// Helper functions to get elements for different template types
function getLandingPageElements(templateId: number) {
  return [
    {
      templateId,
      type: "container",
      name: "Hero Section",
      x: 0,
      y: 80,
      width: 1200,
      height: 500,
      content: null,
      styles: JSON.stringify({
        backgroundColor: "#f9fafb",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }),
      zIndex: 1,
    },
    {
      templateId,
      type: "heading",
      name: "Hero Title",
      x: 300,
      y: 200,
      width: 600,
      height: 60,
      content: "Bem-vindo ao NextGen Site Builder",
      styles: JSON.stringify({
        fontSize: "48px",
        fontWeight: "bold",
        color: "#111827",
        textAlign: "center",
      }),
      zIndex: 2,
    },
    {
      templateId,
      type: "paragraph",
      name: "Hero Description",
      x: 350,
      y: 280,
      width: 500,
      height: 80,
      content: "Crie seu site profissional com nossa plataforma de arrastar e soltar",
      styles: JSON.stringify({
        fontSize: "18px",
        color: "#6b7280",
        textAlign: "center",
      }),
      zIndex: 2,
    },
    {
      templateId,
      type: "button",
      name: "CTA Button",
      x: 500,
      y: 380,
      width: 200,
      height: 50,
      content: "Saiba Mais",
      styles: JSON.stringify({
        backgroundColor: "#3b82f6",
        color: "white",
        border: "none",
        borderRadius: "4px",
        fontWeight: "500",
        fontSize: "16px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }),
      zIndex: 2,
    },
    {
      templateId,
      type: "container",
      name: "Features Section",
      x: 0,
      y: 580,
      width: 1200,
      height: 600,
      content: null,
      styles: JSON.stringify({
        backgroundColor: "white",
        padding: "4rem 2rem",
      }),
      zIndex: 1,
    },
    {
      templateId,
      type: "heading",
      name: "Features Title",
      x: 400,
      y: 600,
      width: 400,
      height: 50,
      content: "Nossos Recursos",
      styles: JSON.stringify({
        fontSize: "36px",
        fontWeight: "bold",
        color: "#111827",
        textAlign: "center",
        marginBottom: "2rem",
      }),
      zIndex: 2,
    },
  ];
}

function getEcommerceElements(templateId: number) {
  return [
    {
      templateId,
      type: "container",
      name: "Products Section",
      x: 0,
      y: 80,
      width: 1200,
      height: 600,
      content: null,
      styles: JSON.stringify({
        backgroundColor: "white",
        padding: "2rem",
      }),
      zIndex: 1,
    },
    {
      templateId,
      type: "heading",
      name: "Products Title",
      x: 20,
      y: 100,
      width: 400,
      height: 50,
      content: "Produtos em Destaque",
      styles: JSON.stringify({
        fontSize: "32px",
        fontWeight: "bold",
        color: "#111827",
      }),
      zIndex: 2,
    },
    {
      templateId,
      type: "productGallery",
      name: "Product Gallery",
      x: 20,
      y: 170,
      width: 1160,
      height: 400,
      content: null,
      styles: JSON.stringify({
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "20px",
      }),
      zIndex: 2,
    },
  ];
}

function getBlogElements(templateId: number) {
  return [
    {
      templateId,
      type: "container",
      name: "Blog Header",
      x: 0,
      y: 80,
      width: 1200,
      height: 200,
      content: null,
      styles: JSON.stringify({
        backgroundColor: "#f3f4f6",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }),
      zIndex: 1,
    },
    {
      templateId,
      type: "heading",
      name: "Blog Title",
      x: 300,
      y: 120,
      width: 600,
      height: 60,
      content: "Meu Blog",
      styles: JSON.stringify({
        fontSize: "42px",
        fontWeight: "bold",
        color: "#111827",
        textAlign: "center",
      }),
      zIndex: 2,
    },
    {
      templateId,
      type: "container",
      name: "Blog Content",
      x: 100,
      y: 300,
      width: 1000,
      height: 600,
      content: null,
      styles: JSON.stringify({
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "2rem",
      }),
      zIndex: 1,
    },
  ];
}

function getPortfolioElements(templateId: number) {
  return [
    {
      templateId,
      type: "container",
      name: "Portfolio Intro",
      x: 0,
      y: 80,
      width: 1200,
      height: 400,
      content: null,
      styles: JSON.stringify({
        backgroundColor: "#111827",
        padding: "3rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }),
      zIndex: 1,
    },
    {
      templateId,
      type: "heading",
      name: "Portfolio Name",
      x: 300,
      y: 180,
      width: 600,
      height: 60,
      content: "João Silva",
      styles: JSON.stringify({
        fontSize: "48px",
        fontWeight: "bold",
        color: "white",
        textAlign: "center",
      }),
      zIndex: 2,
    },
    {
      templateId,
      type: "paragraph",
      name: "Portfolio Tagline",
      x: 350,
      y: 260,
      width: 500,
      height: 40,
      content: "Designer & Desenvolvedor Front-end",
      styles: JSON.stringify({
        fontSize: "20px",
        color: "#d1d5db",
        textAlign: "center",
      }),
      zIndex: 2,
    },
    {
      templateId,
      type: "container",
      name: "Work Gallery",
      x: 0,
      y: 500,
      width: 1200,
      height: 800,
      content: null,
      styles: JSON.stringify({
        padding: "2rem",
      }),
      zIndex: 1,
    },
    {
      templateId,
      type: "heading",
      name: "Works Title",
      x: 20,
      y: 520,
      width: 400,
      height: 50,
      content: "Meus Trabalhos",
      styles: JSON.stringify({
        fontSize: "32px",
        fontWeight: "bold",
        color: "#111827",
      }),
      zIndex: 2,
    },
  ];
}

seed();
