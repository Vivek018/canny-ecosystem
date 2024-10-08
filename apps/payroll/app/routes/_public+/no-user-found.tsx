import { Button } from "@canny_ecosystem/ui/button";
import { Form } from "@remix-run/react";

export default function NoUserFound () {
  return (
    <section className="flex min-h-screen justify-center items-center overflow-hidden p-6 -mt-20 md:p-0">
      <div className="relative z-20 m-auto flex w-full max-w-[380px] flex-col py-8">
        <div className="flex w-full flex-col relative">
          <div className="pb-4 bg-gradient-to-r from-primary dark:via-primary dark:to-[#848484] to-[#000] inline-block text-transparent bg-clip-text mx-auto">
            <h1 className="font-extrabold uppercase pb-1 tracking-widest text-4xl">
              CANNY CMS
            </h1>
          </div>

          <p className="font-medium text-center pb-2 text-[#878787]">
            You do not have access to this website. If you are a client
            of us, please contact us for assistance. If you arrived here by
            mistake, please log out. Thank you!
          </p>

          <div className="pointer-events-auto mt-6 flex flex-col mb-6">
            <Form method="POST" action="/logout">
              <Button type="submit" variant="destructive" className="w-full">
                Logout
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
}
