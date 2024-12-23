"use client"

import { Boxes } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"

export default function ProductsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader 
        title="Products" 
        icon={Boxes}
        iconClass="icon-products"
      />
      <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
        {/* Add product list/grid here */}
      </div>
    </div>
  )
}
