'use client'
import {  useState, useRef, useEffect } from "react"
import { PRODUCT_CATEGORIES } from "./config"
import NavItem from "./NavItem"
import {useOnClickOutside} from "@/hooks/use-on-click-outside"


const NavItems = () =>{
    const [activeIndex, setActiveIndex] = useState<null | Number>(null)

   // Escape keyboard fuction to remove the dropdown from the Navbar
      useEffect(()=>{
        const handler = (e: KeyboardEvent)=>{
            if(e.key === 'Escape') {
                setActiveIndex(null)
            }
        }
        document.addEventListener("keydown", handler)

        return ()=>{
            document.removeEventListener('keydown', handler)
        }
      }, [])


    const isAnyOpen = activeIndex !==null

    const navRef = useRef<HTMLDivElement | null>(null)

    useOnClickOutside(navRef, () => setActiveIndex(null))

     const close = () => {
    setActiveIndex(null);
  };

 return (
    <div className="flex gap-4 h-full" ref={navRef}>
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
         <NavItem category={category} 
         handleOpen={handleOpen} 
         isOpen={isOpen}
          key={category.value} 
          isAnyOpen={isAnyOpen} 
          close={close} />
      )
     })}
    </div>
 )

}

export default NavItems