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
      where: eq(schema.projects.name, "My First Project"),
    });

    let projectId;
    if (!existingProject) {
      console.log("Creating demo project...");
      const [project] = await db.insert(schema.projects).values({
        userId,
        name: "My First Project",
        description: "A demonstration project created with NextGen Site Builder",
        isPublic: false,
      }).returning();
      projectId = project.id;
      console.log(`Created project with ID: ${projectId}`);

      // Create a homepage
      const [page] = await db.insert(schema.pages).values({
        projectId,
        name: "Home",
        slug: "home",
        isHomepage: true,
      }).returning();

      console.log(`Created page with ID: ${page.id}`);

      // Add some basic elements to the homepage
      await db.insert(schema.elements).values([
        {
          pageId: page.id,
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
          pageId: page.id,
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
        {
          pageId: page.id,
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
          pageId: page.id,
          type: "heading",
          name: "Hero Title",
          x: 300,
          y: 200,
          width: 600,
          height: 60,
          content: "Build Your Dream Website",
          styles: JSON.stringify({
            fontSize: "48px",
            fontWeight: "bold",
            color: "#111827",
            textAlign: "center",
          }),
          zIndex: 2,
        },
        {
          pageId: page.id,
          type: "paragraph",
          name: "Hero Description",
          x: 350,
          y: 280,
          width: 500,
          height: 80,
          content: "Create professional websites without coding using our intuitive drag-and-drop editor.",
          styles: JSON.stringify({
            fontSize: "18px",
            color: "#6b7280",
            textAlign: "center",
          }),
          zIndex: 2,
        },
        {
          pageId: page.id,
          type: "button",
          name: "CTA Button",
          x: 500,
          y: 380,
          width: 200,
          height: 50,
          content: "Get Started",
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
      ]);

      console.log("Added basic elements to the homepage");
    } else {
      console.log("Demo project already exists.");
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
