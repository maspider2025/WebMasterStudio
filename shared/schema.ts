import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar, decimal, unique, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Esquemas para tabelas de gerenciamento de projetos e APIs

// Tabela de associação entre projetos e tabelas de banco de dados
export const projectDatabases = pgTable("project_databases", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  tableName: text("table_name").notNull(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  apiEnabled: boolean("api_enabled").default(false),
  isBuiltIn: boolean("is_built_in").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabela de metadados de APIs geradas para tabelas de projeto
export const projectApis = pgTable("project_apis", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  tableId: integer("table_id").references(() => projectDatabases.id),
  apiPath: text("api_path").notNull(),
  method: text("method").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  isCustom: boolean("is_custom").default(false),
  customConfig: jsonb("custom_config"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relações
export const projectDatabasesRelations = relations(projectDatabases, ({ one }) => ({
  project: one(projects, {
    fields: [projectDatabases.projectId],
    references: [projects.id],
  }),
}));

export const projectApisRelations = relations(projectApis, ({ one }) => ({
  project: one(projects, {
    fields: [projectApis.projectId],
    references: [projects.id],
  }),
  table: one(projectDatabases, {
    fields: [projectApis.tableId],
    references: [projectDatabases.id],
    nullable: true,
  }),
}));

// Schemas Zod para validação
export const projectDatabasesInsertSchema = createInsertSchema(projectDatabases);
export const projectDatabasesSelectSchema = createSelectSchema(projectDatabases);
export const projectApisInsertSchema = createInsertSchema(projectApis);
export const projectApisSelectSchema = createSelectSchema(projectApis);

// Exportar funções e tipos da associação entre projetos e tabelas
export { 
  generateProjectTableName, 
  parseProjectTableName as isProjectTable, // Renomeado para compatibilidade
  parseProjectTableName as getDisplayNameFromTableName // Renomeado para compatibilidade
} from "./project-database-association";

// Tipos para uso em outros módulos
export type ProjectDatabase = z.infer<typeof projectDatabasesSelectSchema>;
export type InsertProjectDatabase = z.infer<typeof projectDatabasesInsertSchema>;
export type ProjectApi = z.infer<typeof projectApisSelectSchema>;
export type InsertProjectApi = z.infer<typeof projectApisInsertSchema>;

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Project schema
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  thumbnail: text("thumbnail"),
  isPublic: boolean("is_public").default(false),
  publishedUrl: text("published_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Page schema
export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  isHomepage: boolean("is_homepage").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Element schema
export const elements = pgTable("elements", {
  id: serial("id").primaryKey(),
  pageId: integer("page_id").references(() => pages.id).notNull(),
  type: text("type").notNull(),
  name: text("name"),
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  width: integer("width").notNull(),
  // Propriedades para conexão com banco de dados
  dataConnection: jsonb("data_connection"),
  height: integer("height").notNull(),
  content: text("content"),
  src: text("src"),
  alt: text("alt"),
  styles: jsonb("styles"),
  parent: integer("parent").references(() => elements.id),
  zIndex: integer("z_index").default(0),
  visible: boolean("visible").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Template schema
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  thumbnail: text("thumbnail"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Template elements schema
export const templateElements = pgTable("template_elements", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").references(() => templates.id).notNull(),
  type: text("type").notNull(),
  name: text("name"),
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  content: text("content"),
  src: text("src"),
  alt: text("alt"),
  styles: jsonb("styles"),
  parent: integer("parent").references(() => templateElements.id),
  zIndex: integer("z_index").default(0),
  visible: boolean("visible").default(true),
});

// E-commerce related tables
export const productStatusEnum = pgEnum('product_status', ['draft', 'published', 'archived']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'processing', 'completed', 'cancelled', 'refunded']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'failed', 'refunded']);
export const shippingStatusEnum = pgEnum('shipping_status', ['pending', 'processing', 'shipped', 'delivered']);

export const productCategories = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  image: text("image"),
  parentId: integer("parent_id").references(() => productCategories.id),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }),
  sku: text("sku"),
  status: productStatusEnum("status").default('draft'),
  featured: boolean("featured").default(false),
  inventory: integer("inventory").default(0),
  weight: decimal("weight", { precision: 10, scale: 2 }),
  dimensions: jsonb("dimensions"),
  images: jsonb("images"),
  attributes: jsonb("attributes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productCategoryRelations = pgTable("product_category_relations", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  categoryId: integer("category_id").references(() => productCategories.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  uniqueConstraint: unique().on(t.productId, t.categoryId),
}));

export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  name: text("name").notNull(),
  sku: text("sku"),
  price: decimal("price", { precision: 10, scale: 2 }),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }),
  inventory: integer("inventory").default(0),
  images: jsonb("images"),
  attributes: jsonb("attributes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  company: text("company"),
  phone: text("phone"),
  metadata: jsonb("metadata"),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  type: text("type").default("shipping"), // shipping or billing
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  company: text("company"),
  address1: text("address1").notNull(),
  address2: text("address2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  phone: text("phone"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  customerId: integer("customer_id").references(() => customers.id),
  orderNumber: text("order_number").notNull().unique(),
  status: orderStatusEnum("status").default('pending'),
  paymentStatus: paymentStatusEnum("payment_status").default('pending'),
  shippingStatus: shippingStatusEnum("shipping_status").default('pending'),
  currency: text("currency").default("USD"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0"),
  shipping: decimal("shipping", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  billingAddressId: integer("billing_address_id").references(() => addresses.id),
  shippingAddressId: integer("shipping_address_id").references(() => addresses.id),
  shippingMethod: text("shipping_method"),
  paymentMethod: text("payment_method"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  paypalOrderId: text("paypal_order_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  variantId: integer("variant_id").references(() => productVariants.id),
  name: text("name").notNull(),
  sku: text("sku"),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  customerId: integer("customer_id").references(() => customers.id),
  sessionId: text("session_id").notNull(),
  currency: text("currency").default("USD"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id").references(() => carts.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  variantId: integer("variant_id").references(() => productVariants.id),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Reviews - Avaliações de produtos
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  customerId: integer("customer_id").references(() => customers.id),
  title: text("title"),
  content: text("content").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  status: text("status").default("pending"), // pending, approved, rejected
  isVerifiedPurchase: boolean("is_verified_purchase").default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Wishlist - Lista de desejos
export const wishlists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  name: text("name").default("Default"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const wishlistItems = pgTable("wishlist_items", {
  id: serial("id").primaryKey(),
  wishlistId: integer("wishlist_id").references(() => wishlists.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  variantId: integer("variant_id").references(() => productVariants.id),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

// Discounts - Cupons e descontos
export const discountTypeEnum = pgEnum('discount_type', ['percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y']);

export const discounts = pgTable("discounts", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  code: text("code").notNull(),
  description: text("description"),
  type: discountTypeEnum("type").default("percentage"),
  value: decimal("value", { precision: 10, scale: 2 }),
  minOrderValue: decimal("min_order_value", { precision: 10, scale: 2 }),
  maxUses: integer("max_uses"),
  usesCount: integer("uses_count").default(0),
  isActive: boolean("is_active").default(true),
  startsAt: timestamp("starts_at"),
  expiresAt: timestamp("expires_at"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ProductTags - Tags de produtos para SEO
export const productTags = pgTable("product_tags", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productTagRelations = pgTable("product_tag_relations", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  tagId: integer("tag_id").references(() => productTags.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  uniqueConstraint: unique().on(t.productId, t.tagId),
}));

// Shipping Methods
export const shippingMethods = pgTable("shipping_methods", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  estimatedDeliveryTime: text("estimated_delivery_time"),
  isActive: boolean("is_active").default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Inventory Management
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id),
  variantId: integer("variant_id").references(() => productVariants.id),
  sku: text("sku").notNull(),
  quantity: integer("quantity").default(0).notNull(),
  lowStockThreshold: integer("low_stock_threshold").default(5),
  reservedQuantity: integer("reserved_quantity").default(0),
  location: text("location"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Inventory History
export const inventoryHistory = pgTable("inventory_history", {
  id: serial("id").primaryKey(),
  inventoryId: integer("inventory_id").references(() => inventory.id).notNull(),
  type: text("type").notNull(), // adjustment, order, return, restock
  quantity: integer("quantity").notNull(), // can be positive or negative
  reference: text("reference"), // order number, adjustment ID, etc.
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  key: text("key").notNull(),
  value: jsonb("value"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  uniqueConstraint: unique().on(t.projectId, t.key),
}));

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
  pages: many(pages),
  products: many(products),
  productCategories: many(productCategories),
  productTags: many(productTags),
  customers: many(customers),
  orders: many(orders),
  carts: many(carts),
  settings: many(settings),
  discounts: many(discounts),
  shippingMethods: many(shippingMethods),
  reviews: many(reviews),
  wishlists: many(wishlists),
}));

export const pagesRelations = relations(pages, ({ one, many }) => ({
  project: one(projects, { fields: [pages.projectId], references: [projects.id] }),
  elements: many(elements),
}));

export const elementsRelations = relations(elements, ({ one, many }) => ({
  page: one(pages, { fields: [elements.pageId], references: [pages.id] }),
  parentElement: one(elements, { fields: [elements.parent], references: [elements.id] }),
  childElements: many(elements, { relationName: "parent_child" }),
}));

export const templatesRelations = relations(templates, ({ many }) => ({
  elements: many(templateElements),
}));

export const templateElementsRelations = relations(templateElements, ({ one, many }) => ({
  template: one(templates, { fields: [templateElements.templateId], references: [templates.id] }),
  parentElement: one(templateElements, { fields: [templateElements.parent], references: [templateElements.id] }),
  childElements: many(templateElements, { relationName: "template_parent_child" }),
}));

// E-commerce relations
export const productCategoriesRelations = relations(productCategories, ({ one, many }) => ({
  project: one(projects, { fields: [productCategories.projectId], references: [projects.id] }),
  parent: one(productCategories, { fields: [productCategories.parentId], references: [productCategories.id], relationName: "category_hierarchy" }),
  children: many(productCategories, { relationName: "category_hierarchy" }),
  products: many(productCategoryRelations, { relationName: "category_products" }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  project: one(projects, { fields: [products.projectId], references: [projects.id] }),
  categories: many(productCategoryRelations, { relationName: "product_categories" }),
  variants: many(productVariants),
  orderItems: many(orderItems),
  cartItems: many(cartItems),
  reviews: many(reviews),
  tags: many(productTagRelations, { relationName: "product_tags" }),
  wishlistItems: many(wishlistItems),
  inventory: many(inventory),
}));

export const productCategoryRelationsRelations = relations(productCategoryRelations, ({ one }) => ({
  product: one(products, { fields: [productCategoryRelations.productId], references: [products.id], relationName: "product_categories" }),
  category: one(productCategories, { fields: [productCategoryRelations.categoryId], references: [productCategories.id], relationName: "category_products" }),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
  orderItems: many(orderItems),
  cartItems: many(cartItems),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  project: one(projects, { fields: [customers.projectId], references: [projects.id] }),
  user: one(users, { fields: [customers.userId], references: [users.id] }),
  addresses: many(addresses),
  orders: many(orders),
  carts: many(carts),
  reviews: many(reviews),
  wishlists: many(wishlists),
}));

export const addressesRelations = relations(addresses, ({ one, many }) => ({
  customer: one(customers, { fields: [addresses.customerId], references: [customers.id] }),
  billingOrders: many(orders, { relationName: "billing_address" }),
  shippingOrders: many(orders, { relationName: "shipping_address" }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  project: one(projects, { fields: [orders.projectId], references: [projects.id] }),
  customer: one(customers, { fields: [orders.customerId], references: [customers.id] }),
  billingAddress: one(addresses, { fields: [orders.billingAddressId], references: [addresses.id], relationName: "billing_address" }),
  shippingAddress: one(addresses, { fields: [orders.shippingAddressId], references: [addresses.id], relationName: "shipping_address" }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
  variant: one(productVariants, { fields: [orderItems.variantId], references: [productVariants.id] }),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  project: one(projects, { fields: [carts.projectId], references: [projects.id] }),
  customer: one(customers, { fields: [carts.customerId], references: [customers.id] }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
  product: one(products, { fields: [cartItems.productId], references: [products.id] }),
  variant: one(productVariants, { fields: [cartItems.variantId], references: [productVariants.id] }),
}));

export const settingsRelations = relations(settings, ({ one }) => ({
  project: one(projects, { fields: [settings.projectId], references: [projects.id] }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  avatarUrl: true,
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  userId: true,
  name: true,
  description: true,
  thumbnail: true,
  isPublic: true,
  publishedUrl: true,
});

export const insertPageSchema = createInsertSchema(pages).pick({
  projectId: true,
  name: true,
  slug: true,
  isHomepage: true,
});

export const insertElementSchema = createInsertSchema(elements).pick({
  pageId: true,
  type: true,
  name: true,
  x: true,
  y: true,
  width: true,
  height: true,
  content: true,
  src: true,
  alt: true,
  styles: true,
  parent: true,
  zIndex: true,
  visible: true,
});

export const insertTemplateSchema = createInsertSchema(templates).pick({
  name: true,
  description: true,
  category: true,
  thumbnail: true,
});

export const insertTemplateElementSchema = createInsertSchema(templateElements).pick({
  templateId: true,
  type: true,
  name: true,
  x: true,
  y: true,
  width: true,
  height: true,
  content: true,
  src: true,
  alt: true,
  styles: true,
  parent: true,
  zIndex: true,
  visible: true,
});

// E-commerce schemas
export const insertProductCategorySchema = createInsertSchema(productCategories).pick({
  projectId: true,
  name: true,
  slug: true,
  description: true,
  image: true,
  parentId: true,
  order: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  projectId: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  salePrice: true,
  sku: true,
  status: true,
  featured: true,
  inventory: true,
  weight: true,
  dimensions: true,
  images: true,
  attributes: true,
  metadata: true,
});

export const insertProductCategoryRelationSchema = createInsertSchema(productCategoryRelations).pick({
  productId: true,
  categoryId: true,
});

export const insertProductVariantSchema = createInsertSchema(productVariants).pick({
  productId: true,
  name: true,
  sku: true,
  price: true,
  salePrice: true,
  inventory: true,
  images: true,
  attributes: true,
});

export const insertCustomerSchema = createInsertSchema(customers).pick({
  projectId: true,
  userId: true,
  email: true,
  firstName: true,
  lastName: true,
  company: true,
  phone: true,
  metadata: true,
  stripeCustomerId: true,
});

export const insertAddressSchema = createInsertSchema(addresses).pick({
  customerId: true,
  type: true,
  firstName: true,
  lastName: true,
  company: true,
  address1: true,
  address2: true,
  city: true,
  state: true,
  postalCode: true,
  country: true,
  phone: true,
  isDefault: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  projectId: true,
  customerId: true,
  orderNumber: true,
  status: true,
  paymentStatus: true,
  shippingStatus: true,
  currency: true,
  subtotal: true,
  discount: true,
  tax: true,
  shipping: true,
  total: true,
  billingAddressId: true,
  shippingAddressId: true,
  shippingMethod: true,
  paymentMethod: true,
  notes: true,
  metadata: true,
  stripePaymentIntentId: true,
  paypalOrderId: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  productId: true,
  variantId: true,
  name: true,
  sku: true,
  quantity: true,
  price: true,
  subtotal: true,
  metadata: true,
});

export const insertCartSchema = createInsertSchema(carts).pick({
  projectId: true,
  customerId: true,
  sessionId: true,
  currency: true,
  metadata: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).pick({
  cartId: true,
  productId: true,
  variantId: true,
  quantity: true,
});

export const insertSettingSchema = createInsertSchema(settings).pick({
  projectId: true,
  key: true,
  value: true,
});

// Schemas para as novas tabelas
export const insertReviewSchema = createInsertSchema(reviews).pick({
  projectId: true,
  productId: true,
  customerId: true,
  title: true,
  content: true,
  rating: true,
  status: true,
  isVerifiedPurchase: true,
  metadata: true,
});

export const insertWishlistSchema = createInsertSchema(wishlists).pick({
  projectId: true,
  customerId: true,
  name: true,
  isPublic: true,
});

export const insertWishlistItemSchema = createInsertSchema(wishlistItems).pick({
  wishlistId: true,
  productId: true,
  variantId: true,
});

export const insertDiscountSchema = createInsertSchema(discounts).pick({
  projectId: true,
  code: true,
  description: true,
  type: true,
  value: true,
  minOrderValue: true,
  maxUses: true,
  usesCount: true,
  isActive: true,
  startsAt: true,
  expiresAt: true,
  metadata: true,
});

export const insertProductTagSchema = createInsertSchema(productTags).pick({
  projectId: true,
  name: true,
  slug: true,
});

export const insertProductTagRelationSchema = createInsertSchema(productTagRelations).pick({
  productId: true,
  tagId: true,
});

export const insertShippingMethodSchema = createInsertSchema(shippingMethods).pick({
  projectId: true,
  name: true,
  description: true,
  price: true,
  estimatedDeliveryTime: true,
  isActive: true,
  metadata: true,
});

export const insertInventorySchema = createInsertSchema(inventory).pick({
  productId: true,
  variantId: true,
  sku: true,
  quantity: true,
  lowStockThreshold: true,
  reservedQuantity: true,
  location: true,
  metadata: true,
});

export const insertInventoryHistorySchema = createInsertSchema(inventoryHistory).pick({
  inventoryId: true,
  type: true,
  quantity: true,
  reference: true,
  notes: true,
  createdBy: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertPage = z.infer<typeof insertPageSchema>;
export type Page = typeof pages.$inferSelect;

export type InsertElement = z.infer<typeof insertElementSchema>;

// Estendemos o tipo Element com propriedades adicionais para o editor

export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;

export type InsertTemplateElement = z.infer<typeof insertTemplateElementSchema>;
export type TemplateElement = typeof templateElements.$inferSelect;

// E-commerce types
export type InsertProductCategory = z.infer<typeof insertProductCategorySchema>;
export type ProductCategory = typeof productCategories.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertProductCategoryRelation = z.infer<typeof insertProductCategoryRelationSchema>;
export type ProductCategoryRelation = typeof productCategoryRelations.$inferSelect;

export type InsertProductVariant = z.infer<typeof insertProductVariantSchema>;
export type ProductVariant = typeof productVariants.$inferSelect;

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type Address = typeof addresses.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

export type InsertCart = z.infer<typeof insertCartSchema>;
export type Cart = typeof carts.$inferSelect;

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;

export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;

// Tipos para as novas tabelas
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type InsertWishlist = z.infer<typeof insertWishlistSchema>;
export type Wishlist = typeof wishlists.$inferSelect;

export type InsertWishlistItem = z.infer<typeof insertWishlistItemSchema>;
export type WishlistItem = typeof wishlistItems.$inferSelect;

export type InsertDiscount = z.infer<typeof insertDiscountSchema>;
export type Discount = typeof discounts.$inferSelect;

export type InsertProductTag = z.infer<typeof insertProductTagSchema>;
export type ProductTag = typeof productTags.$inferSelect;

export type InsertProductTagRelation = z.infer<typeof insertProductTagRelationSchema>;
export type ProductTagRelation = typeof productTagRelations.$inferSelect;

export type InsertShippingMethod = z.infer<typeof insertShippingMethodSchema>;
export type ShippingMethod = typeof shippingMethods.$inferSelect;

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;

export type InsertInventoryHistory = z.infer<typeof insertInventoryHistorySchema>;
export type InventoryHistory = typeof inventoryHistory.$inferSelect;

// Interface para tipo Element, incluindo propriedades de conexão com banco de dados
export interface DatabaseConnection {
  tableName?: string;
  displayField?: string;
  valueField?: string;
  filterType?: 'and' | 'or';
  filters?: Array<{field: string; operator: string; value: any}>;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  formMode?: 'create' | 'edit';
  formTable?: string;
  formFields?: Array<{input: string; field: string}>;
  submitRedirect?: string;
  saveButtonText?: string;
  enabled?: boolean;
  elementId?: number;
}

export type Element = typeof elements.$inferSelect & {
  dataConnection?: DatabaseConnection;
  props?: any;
  children?: Element[];
}
