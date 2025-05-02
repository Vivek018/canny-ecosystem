export const termsData = [
  {
    subject: "Eligibility",
    description: `For Companies:
      - Must be a legally registered business in the jurisdiction in which it operates, including having the necessary tax registration, certifications, and licenses to conduct business legally.
      - Must comply with all applicable local, regional, and national labor laws, including employee welfare, health, safety regulations, and any union agreements that may apply.
      - Must ensure that the jobs posted comply with anti-discrimination laws, providing equal opportunities regardless of gender, race, ethnicity, age, religion, or disability.
      - Must adhere to industry-specific regulations, such as those governing data protection, environmental standards, or financial disclosures.

      For Workers:
      - Must be at least 18 years old to ensure legal competence and eligibility to work in most jurisdictions, in accordance with employment and labor laws.
      - Must be authorized to work in the region in which they are seeking employment, whether through citizenship, a valid work visa, or other relevant legal work authorization.
      - Must provide proof of relevant qualifications or certifications when required by the hiring company, ensuring a match with the job requirements.
      - Should not have any legal restrictions that would prevent them from being employed or participating in the workforce, such as outstanding criminal charges or restrictions related to immigration status.`,
  },
  {
    subject: "Account Registration",
    description: `Requirements:
      - Provide accurate and truthful information during the registration process, including legal name, contact details, email, address, and any other required information.
      - Ensure that the information provided is updated regularly, especially details such as contact information, address, and any other data that might change over time.
      - Ensure that the account is registered with a valid and accessible email address, as this will be used for important communications regarding account updates, security alerts, and platform-related information.
      - Create a strong password that adheres to the platform's security guidelines to protect your account from unauthorized access. We recommend using a combination of letters, numbers, and special characters.

      Responsibilities:
      - Keep your login details secure and do not share your account credentials with others. The platform is not responsible for any activity under your account if your credentials are compromised.
      - Do not engage in fraudulent activity, including impersonating another individual or entity, creating fake profiles, or posting false information.
      - Refrain from sharing your account with others to maintain the integrity of the platform. Only the registered user should have access to their account.
      - Users are responsible for ensuring that their account is not used for malicious purposes, such as spamming or other activities that could harm other users or the platform itself.`,
  },
  {
    subject: "Services Offered",
    description: `We provide a comprehensive platform designed to facilitate interactions between companies and workers. Our services include:
      - Companies can post job opportunities, including details such as position titles, job descriptions, salary ranges, location, and any required qualifications.
      - Workers can browse job listings by category, location, or other filters, allowing them to apply for positions that match their skill set and preferences.
      - Communication tools are provided to facilitate direct interactions between companies and workers, including private messaging and secure file sharing to discuss job details, expectations, and contract terms.
      - Workers can also update their profiles to include work experience, education, certifications, and any other relevant information that may increase their chances of being hired.
      - The platform may offer additional services, such as job matching based on skills, salary expectations, and location preferences, or a job alert system that notifies workers when new opportunities that match their profile are posted.
      - Employers can access additional premium features, such as enhanced visibility for job postings or access to a larger pool of candidates through targeted ads or boosted posts.`,
  },
  {
    subject: "User Responsibilities",
    description: `As a user of the platform, you agree to the following:
      - You will comply with the platform's rules and regulations at all times, including those that pertain to posting content, engaging with other users, and participating in discussions.
      - You will not engage in fraudulent, harmful, or illegal activities while using the platform, such as posting job listings that are misleading, offering employment in violation of labor laws, or engaging in discriminatory practices.
      - You will respect the privacy and confidentiality of other users and not disclose personal information shared in good faith, unless required by law or to resolve a legal dispute.
      - You will adhere to any applicable laws and regulations related to data protection, and not misuse the platform's features for unauthorized surveillance or data mining purposes.
      - You will report any suspicious or fraudulent activity on the platform to ensure that the community remains safe and trustworthy.
      - You will not engage in activities that may harm the platform, its services, or other users, such as uploading malware, attempting to bypass security measures, or manipulating platform features to gain unfair advantages.`,
  },
  {
    subject: "Payment Terms",
    description: `Payment for services rendered through the platform will be processed as follows:
      - Workers will receive payments directly from the hiring companies, in accordance with the terms agreed upon in their employment contract, which may include payment frequency, amounts, and methods of payment (e.g., bank transfer, PayPal, or another secure method).
      - The platform may charge a processing fee for certain payment transactions, which will be clearly disclosed prior to the payment being made. Any applicable fees will be deducted before payments are transferred to the workers.
      - Workers are responsible for providing accurate payment details, such as their bank account or PayPal account information, to ensure timely and accurate payments.
      - Companies are responsible for ensuring that payments are made on time and in full, as per the terms agreed upon with the worker. The platform does not intervene in disputes regarding payment terms between companies and workers.
      - In cases where the platform charges fees for additional services (e.g., premium job postings, enhanced visibility), these fees will be transparent and clearly stated during the payment process.
      - The platform may suspend or terminate a user's account if payments are not processed in accordance with the platform's guidelines or if fraudulent payment activity is detected.`,
  },
  {
    subject: "Confidentiality",
    description:
      "All users of the platform are required to maintain the confidentiality of sensitive or proprietary information shared through the platform. This includes information about job opportunities, worker qualifications, personal communication, and other private details that are shared in the course of using the platform. Users should not disclose this information to third parties unless Required by law or in the course of a legal dispute. Necessary to facilitate the provision of services, such as sharing information with service providers or contractors who are bound by confidentiality agreements. Both parties involved in the exchange of information have given explicit consent for disclosure. Breaches of confidentiality could lead to suspension or termination of the user's account, legal action, or other penalties as outlined by the platform's terms and the applicable laws.",
  },
  {
    subject: "Termination of Account",
    description: `We reserve the right to suspend or terminate your account if you:
      - Violate any of the platform's terms and conditions, such as engaging in fraudulent activities, posting discriminatory job listings, or violating intellectual property rights.
      - Engage in fraudulent or illegal activities, including identity theft, financial fraud, or violating intellectual property rights.
      - Provide false or misleading information during registration, including falsifying qualifications, experience, or identity.
      - Engage in abusive or harmful behavior toward other users, such as harassment, threats, or spreading misinformation.
      - Fail to comply with legal requests or investigations by authorities regarding any misconduct related to the platform.
      - Engage in practices that disrupt the normal functioning of the platform, including using bots, exploiting security vulnerabilities, or causing system crashes.
      
      In such cases, we may take actions such as removing job postings, terminating user accounts, or reporting the matter to law enforcement agencies. Any terminated account will be permanently removed from the platform, and the user may not be allowed to create a new account.`,
  },
];

export default function Terms() {
  return (
    <section className="pb-10 md:pb-20">
      <div className="my-8 text-center">
        <span className="text-5xl h-14 font-extrabold bg-gradient-to-r from-primary dark:via-primary dark:to-[#848484] to-[#000] inline-block text-transparent bg-clip-text">
          Terms & Conditions
        </span>
      </div>
      <article className="mx-5 md:mx-10">
        <div className="w-full flex justify-between">
          <div className="w-full select-text h-max flex flex-col justify-between py-4 gap-2">
            <h3 className="text-lg tracking-wider font-extrabold">
              Effective Date
            </h3>
            <p className="text-sm pb-2">12/12/12</p>
          </div>
          <div className="w-full items-end select-text h-max flex flex-col justify-between py-4 gap-2">
            <h3 className="text-lg tracking-wider font-extrabold">
              Updated Date
            </h3>
            <p className="text-sm pb-2">09/11/01</p>
          </div>
        </div>
        <hr className="my-4 md:my-6" />
        {termsData.map((term, index) => (
          <div
            key={index.toString()}
            className="w-full select-text h-max flex flex-col justify-between py-4 gap-2"
          >
            <h3 className="text-lg tracking-wider font-extrabold">
              {term.subject}
            </h3>
            <p className="text-sm pb-2">{term.description}</p>
          </div>
        ))}
      </article>
    </section>
  );
}
