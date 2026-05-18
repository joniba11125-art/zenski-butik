import { Hero } from '@/components/shop/Hero'
import { FeaturedProducts } from '@/components/shop/FeaturedProducts'
import { Testimonials } from '@/components/shop/Testimonials'

export default function HomePage() {
  return (
    <div>
      <Hero />
      <FeaturedProducts />
      <Testimonials />
    </div>
  )
}