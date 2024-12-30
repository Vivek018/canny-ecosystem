import { termsData } from "@canny_ecosystem/utils/constant";

export default function Terms() {
  return (
    <section className='pb-10 md:pb-20'>
      <div className='my-8 text-center'>
        <span className='text-5xl h-14 font-extrabold bg-gradient-to-r from-primary dark:via-primary dark:to-[#848484] to-[#000] inline-block text-transparent bg-clip-text'>
          Terms & Conditions
        </span>
      </div>
      <article className='mx-5 md:mx-10'>
        <div className='w-full flex justify-between'>
          <div className='w-full select-text h-max flex flex-col justify-between py-4 gap-2'>
            <h3 className='text-lg tracking-wider font-extrabold'>
              Effective Date
            </h3>
            <p className='text-sm pb-2'>12/12/12</p>
          </div>
          <div className='w-full items-end select-text h-max flex flex-col justify-between py-4 gap-2'>
            <h3 className='text-lg tracking-wider font-extrabold'>
              Updated Date
            </h3>
            <p className='text-sm pb-2'>09/11/01</p>
          </div>
        </div>
        <hr className='my-4 md:my-6' />
        {termsData.map((term, index) => (
          <div
            key={index.toString()}
            className='w-full select-text h-max flex flex-col justify-between py-4 gap-2'
          >
            <h3 className='text-lg tracking-wider font-extrabold'>
              {term.subject}
            </h3>
            <p className='text-sm pb-2'>{term.description}</p>
          </div>
        ))}
      </article>
    </section>
  );
}
