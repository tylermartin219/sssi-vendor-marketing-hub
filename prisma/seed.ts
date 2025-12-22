import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create companies
  let ssCompany = await prisma.company.findFirst({
    where: { name: "SS&Si" },
  });
  if (!ssCompany) {
    ssCompany = await prisma.company.create({
      data: {
        name: "SS&Si",
      },
    });
  }

  let exampleCompany = await prisma.company.findFirst({
    where: { name: "Example Company" },
  });
  if (!exampleCompany) {
    exampleCompany = await prisma.company.create({
      data: {
        name: "Example Company",
      },
    });
  }
  console.log("✅ Created companies");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@sssi.com" },
    update: {},
    create: {
      email: "admin@sssi.com",
      name: "Admin User",
      password: hashedPassword,
      role: "admin",
      companyId: ssCompany.id,
    },
  });
  console.log("✅ Created admin user: admin@sssi.com / admin123");

  // Create vendor user
  const vendorPassword = await bcrypt.hash("vendor123", 10);
  const vendor = await prisma.user.upsert({
    where: { email: "vendor@example.com" },
    update: {},
    create: {
      email: "vendor@example.com",
      name: "Test Vendor",
      password: vendorPassword,
      role: "vendor",
      companyId: exampleCompany.id,
    },
  });
  console.log("✅ Created vendor user: vendor@example.com / vendor123");

  // Create promotions
  const promotions = [
    {
      title: "Suite Stakes",
      url: "/potm",
      blurb: "Win big with our Suite Stakes promotion! Showcase your products and compete for premium placement.",
      imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
      active: true,
      contentJson: JSON.stringify({
        overview: "<p>Suite Stakes is our premier vendor competition program. Showcase your best products and compete for premium placement in our marketing materials.</p>",
        howItWorks: "<p>Submit your products, and our team will evaluate them based on quality, innovation, and market fit. Winners receive featured placement.</p>",
        timeline: "<p>Applications open quarterly. Winners announced at the end of each quarter.</p>",
      }),
      ctaLabel: "Learn More",
    },
    {
      title: "Product of the Month",
      url: "/potm",
      blurb: "Get your product featured in our monthly spotlight. Apply now to be considered for next month's feature.",
      imageUrl: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800",
      active: true,
      contentJson: JSON.stringify({
        overview: "<p>Product of the Month highlights exceptional vendor products in our marketing channels.</p>",
        howItWorks: "<p>Apply for any open month slot. Our team reviews applications and selects featured products.</p>",
        timeline: "<p>Applications accepted year-round. Featured products announced at the start of each month.</p>",
      }),
      ctaLabel: "Apply Now",
    },
    {
      title: "Co-Branded Swag",
      url: "/swag",
      blurb: "Order custom co-branded merchandise featuring both SS&Si and your company branding.",
      imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
      active: true,
      contentJson: JSON.stringify({
        overview: "<p>Create custom co-branded merchandise to promote your partnership with SS&Si.</p>",
        howItWorks: "<p>Browse our product catalog, add items to your quote, and we'll provide pricing and customization options.</p>",
        timeline: "<p>Quote requests typically processed within 2-3 business days.</p>",
      }),
      ctaLabel: "Shop Now",
    },
  ];

  for (const promo of promotions) {
    // Check if promotion exists by title, if not create it
    const existing = await prisma.promotion.findFirst({
      where: { title: promo.title },
    });
    
    if (!existing) {
      await prisma.promotion.create({
        data: promo,
      });
    } else {
      await prisma.promotion.update({
        where: { id: existing.id },
        data: {
          url: promo.url,
          ctaLabel: promo.ctaLabel,
        },
      });
    }
  }
  console.log("✅ Created 3 promotions");

  // Create POTM months for current year
  const currentYear = new Date().getFullYear();
  for (let month = 1; month <= 12; month++) {
    const monthKey = `${currentYear}-${String(month).padStart(2, "0")}`;
    await prisma.pOTMMonth.upsert({
      where: { monthKey },
      update: {},
      create: {
        monthKey,
        status: "open",
      },
    });
  }
  console.log("✅ Created 12 POTM months for", currentYear);

  // Create products
  const products = [
    {
      name: "Premium T-Shirt",
      category: "Apparel",
      description: "High-quality cotton t-shirt with co-branded logo placement options.",
      imagesJson: JSON.stringify([
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
      ]),
      coBrandingNotes: "Logo can be placed on front, back, or sleeve. Multiple color options available.",
      active: true,
    },
    {
      name: "Custom Water Bottle",
      category: "Drinkware",
      description: "Insulated stainless steel water bottle with custom printing.",
      imagesJson: JSON.stringify([
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400",
      ]),
      coBrandingNotes: "Full wrap printing available. Multiple sizes: 16oz, 20oz, 32oz.",
      active: true,
    },
    {
      name: "Logo Stickers",
      category: "Accessories",
      description: "Vinyl stickers with your logo and SS&Si branding.",
      imagesJson: JSON.stringify([
        "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400",
      ]),
      coBrandingNotes: "Available in various sizes and finishes (matte, glossy, holographic).",
      active: true,
    },
    {
      name: "Notebook Set",
      category: "Office Supplies",
      description: "Premium notebooks with custom cover design.",
      imagesJson: JSON.stringify([
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
      ]),
      coBrandingNotes: "Custom cover design with both logos. Available in lined, grid, or blank.",
      active: true,
    },
    {
      name: "Tote Bag",
      category: "Bags",
      description: "Eco-friendly canvas tote bag with screen printing.",
      imagesJson: JSON.stringify([
        "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400",
      ]),
      coBrandingNotes: "Large print area for co-branding. Multiple color options.",
      active: true,
    },
    {
      name: "USB Drive",
      category: "Electronics",
      description: "Custom branded USB drives with your logo.",
      imagesJson: JSON.stringify([
        "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400",
      ]),
      coBrandingNotes: "Available in 8GB, 16GB, 32GB, 64GB. Custom engraving available.",
      active: true,
    },
    {
      name: "Pen Set",
      category: "Office Supplies",
      description: "Premium pen set with custom branding.",
      imagesJson: JSON.stringify([
        "https://images.unsplash.com/photo-1583484963886-cce2ffd11b80?w=400",
      ]),
      coBrandingNotes: "Available in ballpoint, gel, or fountain pen styles.",
      active: true,
    },
    {
      name: "Hoodie",
      category: "Apparel",
      description: "Comfortable hoodie with embroidered logos.",
      imagesJson: JSON.stringify([
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400",
      ]),
      coBrandingNotes: "Embroidery or screen print options. Multiple colors and sizes.",
      active: true,
    },
    {
      name: "Coffee Mug",
      category: "Drinkware",
      description: "Ceramic coffee mug with custom printing.",
      imagesJson: JSON.stringify([
        "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400",
      ]),
      coBrandingNotes: "Full wrap or single-side printing. Available in 11oz and 15oz.",
      active: true,
    },
    {
      name: "Laptop Sleeve",
      category: "Bags",
      description: "Protective laptop sleeve with custom branding.",
      imagesJson: JSON.stringify([
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
      ]),
      coBrandingNotes: "Available for 13\", 15\", and 17\" laptops. Multiple color options.",
      active: true,
    },
    {
      name: "Keychain",
      category: "Accessories",
      description: "Custom metal keychain with engraved logos.",
      imagesJson: JSON.stringify([
        "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400",
      ]),
      coBrandingNotes: "Metal or leather options. Custom engraving available.",
      active: true,
    },
    {
      name: "Desk Mat",
      category: "Office Supplies",
      description: "Large desk mat with custom printing.",
      imagesJson: JSON.stringify([
        "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400",
      ]),
      coBrandingNotes: "Available in multiple sizes. Waterproof and easy to clean.",
      active: true,
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }
  console.log("✅ Created 12 products");

  // Create assets
  const assets = [
    {
      title: "SS&Si Primary Logo",
      category: "Logos",
      description: "Main logo in PNG and SVG formats",
      fileUrl: "https://via.placeholder.com/800x200/0066CC/FFFFFF?text=SS%26Si+Logo",
    },
    {
      title: "SS&Si Secondary Logo",
      category: "Logos",
      description: "Secondary logo variant",
      fileUrl: "https://via.placeholder.com/800x200/0066CC/FFFFFF?text=SS%26Si+Secondary",
    },
    {
      title: "Brand Guidelines PDF",
      category: "Guidelines",
      description: "Complete brand guidelines document",
      fileUrl: "https://via.placeholder.com/800x1000/FFFFFF/000000?text=Brand+Guidelines",
    },
    {
      title: "Color Palette",
      category: "Guidelines",
      description: "Official color palette and usage guidelines",
      fileUrl: "https://via.placeholder.com/800x600/0066CC/FFFFFF?text=Color+Palette",
    },
    {
      title: "Email Signature Template",
      category: "Templates",
      description: "HTML email signature template",
      fileUrl: "https://via.placeholder.com/600x200/FFFFFF/000000?text=Email+Signature",
    },
    {
      title: "Social Media Template",
      category: "Templates",
      description: "Social media post templates",
      fileUrl: "https://via.placeholder.com/1200x630/0066CC/FFFFFF?text=Social+Media+Template",
    },
    {
      title: "Product Photography",
      category: "Product Images",
      description: "High-resolution product images",
      fileUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200",
    },
  ];

  for (const asset of assets) {
    await prisma.asset.create({
      data: asset,
    });
  }
  console.log("✅ Created 7 assets");

  // Create resources
  const resources = [
    {
      title: "Vendor Onboarding Guide",
      category: "Documentation",
      description: "Complete guide for new vendors",
      url: "https://example.com/onboarding",
    },
    {
      title: "Marketing Best Practices",
      category: "Guides",
      description: "Tips and best practices for vendor marketing",
      url: "https://example.com/best-practices",
    },
    {
      title: "API Documentation",
      category: "Documentation",
      description: "Technical API documentation",
      url: "https://example.com/api-docs",
    },
    {
      title: "Case Study Template",
      category: "Templates",
      description: "Template for creating case studies",
      fileUrl: "https://via.placeholder.com/800x1000/FFFFFF/000000?text=Case+Study+Template",
    },
    {
      title: "Webinar Recording: Getting Started",
      category: "Videos",
      description: "Recorded webinar for new vendors",
      url: "https://example.com/webinar",
    },
    {
      title: "FAQ Document",
      category: "Documentation",
      description: "Frequently asked questions",
      fileUrl: "https://via.placeholder.com/800x1000/FFFFFF/000000?text=FAQ",
    },
  ];

  for (const resource of resources) {
    await prisma.resource.create({
      data: resource,
    });
  }
  console.log("✅ Created 6 resources");

  console.log("\n🎉 Seeding completed!");
  console.log("\n📝 Login credentials:");
  console.log("   Admin: admin@sssi.com / admin123");
  console.log("   Vendor: vendor@example.com / vendor123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

