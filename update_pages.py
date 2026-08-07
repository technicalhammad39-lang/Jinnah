import re

# Update categories/page.tsx
with open('app/categories/page.tsx', 'r', encoding='utf-8') as f:
    cat_content = f.read()

# Make Applications section light theme
cat_content = cat_content.replace('bg-[#1a1917] rounded-[2.5rem] md:rounded-[3rem] text-white', 'bg-white border border-black/5 rounded-[2.5rem] md:rounded-[3rem] text-[#1a1917]')
cat_content = cat_content.replace('bg-[radial-gradient(ellipse_at_top,rgba(255,106,42,0.15)_0%,transparent_70%)]', 'bg-[radial-gradient(ellipse_at_top,rgba(255,106,42,0.08)_0%,transparent_70%)]')
cat_content = cat_content.replace('border-white/10 bg-white/5 text-white/70', 'border-black/5 bg-black/5 text-muted-foreground')
cat_content = cat_content.replace('text-white/60', 'text-muted-foreground')

# The card
old_card = 'bg-gradient-to-br from-[#202020]/95 via-[#171717]/95 to-[#111111]/95 backdrop-blur-2xl hover:border-[#FF6A2A]/40 hover:shadow-[0_30px_80px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.05)] hover:-translate-y-2 hover:scale-[1.02] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.02)]'
new_card = 'bg-gradient-to-br from-white via-white to-orange-50/50 hover:border-[#FF6A2A]/30 hover:shadow-[0_30px_80px_rgba(255,106,42,0.1),inset_0_1px_1px_rgba(255,255,255,1)] hover:-translate-y-2 hover:scale-[1.02] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,1)]'
cat_content = cat_content.replace(old_card, new_card)
cat_content = cat_content.replace('border-white/10 transition-all duration-700', 'border-black/5 transition-all duration-700')

# Card title and desc
cat_content = cat_content.replace('tracking-tight text-white mb-3', 'tracking-tight text-[#1a1917] mb-3')
cat_content = cat_content.replace('font-medium text-white/70', 'font-medium text-muted-foreground')

with open('app/categories/page.tsx', 'w', encoding='utf-8') as f:
    f.write(cat_content)


# Update brands/page.tsx
with open('app/brands/page.tsx', 'r', encoding='utf-8') as f:
    brands_content = f.read()

# Update imports
brands_content = brands_content.replace('import { Shield, Sparkles, Zap, ArrowRight } from "lucide-react";', 'import { ArrowRight, Box, Layers, Hammer, ShieldCheck } from "lucide-react";')

# Update brandFeatures
old_features = """  const brandFeatures = [
    { title: "Curated Excellence", icon: Sparkles, desc: "We exclusively partner with manufacturers who consistently meet our rigorous standards for material quality, intricate design, and architectural integrity." },
    { title: "Authenticity Guaranteed", icon: Shield, desc: "As a direct authorized importer for all listed luxury brands, we ensure 100% genuine products accompanied by full international warranties." },
    { title: "Latest Innovations", icon: Zap, desc: "Always at the forefront, we are the first to bring global architectural hardware innovations and smart security systems to the local market." },
  ];"""
new_features = """  const brandFeatures = [
    { title: "Residential Villas", icon: Box, desc: "Premium fittings for luxury home entrances and interiors. Ensuring unparalleled security combined with bespoke architectural aesthetics for modern and classic estates." },
    { title: "Commercial Offices", icon: Layers, desc: "High-traffic endurance hardware and access control. Engineered to withstand heavy daily use while maintaining sleek, professional profiles for corporate environments." },
    { title: "Hospitality", icon: ShieldCheck, desc: "Electronic hotel locks and master key systems. Delivering seamless guest experiences through cutting-edge access technology and highly durable, beautifully finished door hardware." },
    { title: "Industrial", icon: Hammer, desc: "Heavy-duty machinery and power tools for construction. Built for extreme conditions, providing uncompromising reliable performance and safety for large-scale industrial projects." },
  ];"""
brands_content = brands_content.replace(old_features, new_features)

# Extract sections
# Brands Grid
grid_start = brands_content.find('{/* BRANDS GRID */}')
grid_end = brands_content.find('{/* CTA */}', grid_start)
brands_grid = brands_content[grid_start:grid_end]

# Brand Values
values_start = brands_content.find('{/* BRAND VALUES */}')
values_end = brands_content.find('{/* BRANDS GRID */}', values_start)
brand_values = brands_content[values_start:values_end]

# Modify Brand Values to light theme
brand_values = brand_values.replace('grid-cols-3', 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4')
brand_values = brand_values.replace('bg-[#1a1917] rounded-[2.5rem] md:rounded-[3rem] text-white', 'bg-white border border-black/5 rounded-[2.5rem] md:rounded-[3rem] text-[#1a1917]')
brand_values = brand_values.replace('bg-[radial-gradient(ellipse_at_top,rgba(255,106,42,0.15)_0%,transparent_70%)]', 'bg-[radial-gradient(ellipse_at_top,rgba(255,106,42,0.08)_0%,transparent_70%)]')
brand_values = brand_values.replace('border-white/10 bg-white/5 text-white/70', 'border-black/5 bg-black/5 text-muted-foreground')
brand_values = brand_values.replace('text-white/60', 'text-muted-foreground')
brand_values = brand_values.replace(old_card, new_card)
brand_values = brand_values.replace('border-white/10 transition-all duration-700', 'border-black/5 transition-all duration-700')
brand_values = brand_values.replace('tracking-tight text-white mb-3', 'tracking-tight text-[#1a1917] mb-3')
brand_values = brand_values.replace('font-medium text-white/70', 'font-medium text-muted-foreground')
brand_values = brand_values.replace('gap-y-16 lg:gap-y-12 mt-12', 'gap-x-6 lg:gap-x-8 gap-y-16 lg:gap-y-20 mt-12')

# CTA replacement
new_cta = """        {/* CTA */}
        <section className="relative py-24 px-6 max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left space-y-8 max-w-xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-foreground leading-[1.1]">
              Looking for a <br className="hidden lg:block"/> specific brand?
            </h2>
            <p className="text-muted-foreground font-medium text-sm md:text-base mb-2">
              Our catalog is constantly expanding. If you don't see your preferred brand, contact our procurement team for custom sourcing.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
              <span>Contact Sourcing</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="w-full md:w-auto flex justify-center md:justify-end pr-0 md:pr-12 lg:pr-24 mt-16 md:mt-0">
            <motion.div
              initial={{ y: 150, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "0px 0px -50px 0px" }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
              className="relative w-[280px] h-[280px] md:w-[350px] md:h-[350px]"
            >
              <Image 
                src="/cartoon-call.png" 
                alt="Call Specialist" 
                fill 
                className="object-contain object-bottom drop-shadow-2xl" 
              />
            </motion.div>
          </div>
        </section>"""

brands_content = brands_content[:values_start] + brands_grid + brand_values + new_cta + '\n\n      </main>\n      <Footer />\n    </div>\n  );\n}\n'

with open('app/brands/page.tsx', 'w', encoding='utf-8') as f:
    f.write(brands_content)

print("Updates completed successfully.")
