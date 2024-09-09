"use client"
import { Icons } from "@/components/Icons"
import { Button, buttonVariants } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AuthCredentialsValidator, TAuthCredentialsValidator } from "@/lib/validators/account-credentials-validator"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"
import { ZodError } from "zod"
import { useRouter, useSearchParams } from "next/navigation"






const Page = () => {
     
    const searchParams = useSearchParams( )
    const router = useRouter()

    const isSeller = searchParams.get("as") === "seller" 
    const origin = searchParams.get("origin")


    const ContinueAsSeller = () => {
         router.push("?as=seller")
    }

    const ContinueAsBuyer = () => {
        router.replace("/sign-in", undefined)
    }



   
     const {
        register, 
        handleSubmit, 
        formState: {errors} 
    } = useForm<TAuthCredentialsValidator>({
        resolver: zodResolver(AuthCredentialsValidator)
     })
       
     // making this call from trpc router
     
     const {mutate: signIn, isLoading} = trpc.auth.signIn.useMutation({
         onSuccess: () => {
            toast.success("Signed in sucessfully")

            router.refresh()

            if (origin) {
                router.push(`/${origin}`)
            return 
            }

            if (isSeller) {
                router.push("/sell")
                
             return
            }


            router.push("/")
         },

         onError: (err) => {
            if (err.data?.code === "UNAUTHORIZED") {
                toast.error("Invalid email or password.")
            }
         }
     })
    
      


     const onSubmit = ({email, password}: TAuthCredentialsValidator) =>{
        //    send data to server 
        signIn ({email, password})
     }

    return (
        <>
           <div className="container relative flex pt-20 flex-col items-center justify-center lg:px-0">
              <div className="mx-auto flex w-full flex-col justify-center space-y-5 sm:w-[350px]">
                <div className="flex flex-col items-center space-y-2 text-center">
                    <Icons.logo  className="h-20 w-20"/>
                    <h1 className="text-2lx font-bold">
                        Sign in into your {isSeller ? "seller" : ""} {" "} account</h1>

                        <Link className={buttonVariants({variant: "link",
                        className: "gap-1.5"
                        })}
                         href="/sign-up">
                        Don&apos;t have an accout? Sign-up
                        <ArrowRight className="h-4 w-4" />
                        </Link>
                </div>
                <div className="grid gap-6">
                    <form onSubmit={handleSubmit(onSubmit)} >
                        <div className="grid gap-2">
                            <div className="grid gap-1 py-2">
                               <Label htmlFor="email" className="mb-1">Email</Label>
                               <Input
                               {...register("email")}
                               className={cn({"focus-visible:ring-red-500":
                                errors.email
                               })} 
                               placeholder="you@example.com"
                               type="email"
                               />
                               {errors?.email && (
                                <p className="text-sm text-red-500">{errors.email.message}</p>
                               )}
                            </div>

                            <div className="grid gap-1 py-2">
                               <Label htmlFor="password" className="mb-1">Password</Label>
                               <Input 
                                 {...register("password")}
                               className={cn({"focus-visible:ring-red-500":
                                errors.password

                               })} 
                               placeholder="Password"
                               type="password"
                               />
                               {errors?.password && (
                                <p className="text-sm text-red-500">{errors.password.message}</p>
                               )}
                            </div>
                            <Button>Sign in</Button>
                        </div>
                    </form>

                    <div className="relative">
                        <div aria-hidden="true"
                         className="abusolute inset-0 flex items-center">
                            <span className="w-full border-t"/>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase ">
                            <span className="bg-background px-2 text-muted-foreground">
                                or</span>
                        </div>
                    </div>
                    {isSeller ? (
                        <Button 
                        onClick={ContinueAsBuyer} 
                        variant="secondary" 
                        disabled={isLoading}>
                            Continue as customer</Button>
                    ) : (
                        <Button 
                        onClick={ContinueAsSeller} 
                        variant="secondary" 
                        disabled={isLoading}>
                            Continue as seller  </Button>
                    )}
                </div>
              </div>
           </div>
        </>
    ) 

}


export default Page