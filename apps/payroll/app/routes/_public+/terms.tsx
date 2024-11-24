import { termsData } from "@canny_ecosystem/utils/constant";



export default function Terms() {
  return (
    <>
      <div className="my-8 text-center">
        <span className="text-[3rem] font-extrabold bg-gradient-to-r from-primary dark:via-primary dark:to-[#848484] to-[#000] inline-block text-transparent bg-clip-text">
          Terms & Conditions
        </span>
      </div>
      <div className="ml-[60px] mr-[50px]">
        {termsData.map((term,index) => (
          <div key={index} className="w-full select-text cursor-auto  h-max flex flex-col justify-between py-4">
            <div className="flex flex-row space-y-0 items-center justify-between py-1">
              <h3 className="text-base text-primary tracking-wide font-bold">
                {term.subject}
              </h3>
            </div>

            <div>
              <article className="pb-2">
                <p className="text-sm text-white">{term.description}</p>
              </article>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
