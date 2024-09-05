'use client'
import { act, useState } from "react"
import { PRODUCT_CATEGORIES } from "./config"
import NavItem from "./NavItem"


const NavItems = () =>{
    const [activeIndex, setActiveIndex] = useState<null | Number>(null)

   
    const isAnyOpen = activeIndex !==null

 return (
    <div className="flex gap-4 h-full">
     {PRODUCT_CATEGORIES.map((category, i)=>{
      
      // to track which index that is currently open and one that is not on the Navbar
      const handleOpen = () =>{
        if (activeIndex === i) {
            setActiveIndex(null)
        }else {
            setActiveIndex(i)
        }
      }
      const isOpen = i === activeIndex
      return (
         <NavItem category={category} handleOpen={handleOpen} isOpen={isOpen} 
         key={category.value} isAnyOpen={isAnyOpen} />
      )
     })}
    </div>
 )

}

export default NavItems