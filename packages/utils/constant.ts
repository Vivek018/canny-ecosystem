export const SECONDS_IN_A_MONTH = 60 * 60 * 24 * 30;

export const DELETE_TEXT = "permanently delete";

export const modalSearchParamNames = {
  import_employee:"import-employee",
  import_reimbursement: "import-reimbursement",
  view_link_template: "view-link-template", 
  create_link_template: "create-link-template",
  update_link_template: "update-link-template",
  view_relationship_terms: "view-relationship-terms",
  view_pay_sequence: "view-pay-sequence",
  edit_pay_sequence: "edit-pay-sequence",
};

export const statesAndUTs = [
  { value: "andhra_pradesh", label: "Andhra Pradesh" },
  { value: "arunachal_pradesh", label: "Arunachal Pradesh" },
  { value: "assam", label: "Assam" },
  { value: "bihar", label: "Bihar" },
  { value: "chhattisgarh", label: "Chhattisgarh" },
  { value: "goa", label: "Goa" },
  { value: "gujarat", label: "Gujarat" },
  { value: "haryana", label: "Haryana" },
  { value: "himachal_pradesh", label: "Himachal Pradesh" },
  { value: "jharkhand", label: "Jharkhand" },
  { value: "karnataka", label: "Karnataka" },
  { value: "kerala", label: "Kerala" },
  { value: "madhya_pradesh", label: "Madhya Pradesh" },
  { value: "maharashtra", label: "Maharashtra" },
  { value: "manipur", label: "Manipur" },
  { value: "meghalaya", label: "Meghalaya" },
  { value: "mizoram", label: "Mizoram" },
  { value: "nagaland", label: "Nagaland" },
  { value: "odisha", label: "Odisha" },
  { value: "punjab", label: "Punjab" },
  { value: "rajasthan", label: "Rajasthan" },
  { value: "sikkim", label: "Sikkim" },
  { value: "tamil_nadu", label: "Tamil Nadu" },
  { value: "telangana", label: "Telangana" },
  { value: "tripura", label: "Tripura" },
  { value: "uttar_pradesh", label: "Uttar Pradesh" },
  { value: "uttarakhand", label: "Uttarakhand" },
  { value: "west_bengal", label: "West Bengal" },
  {
    value: "andaman_and_nicobar_islands",
    label: "Andaman and Nicobar Islands",
  },
  { value: "chandigarh", label: "Chandigarh" },
  {
    value: "dadra_and_nagar_haveli_and_daman_and_diu",
    label: "Dadra and Nagar Haveli and Daman and Diu",
  },
  { value: "lakshadweep", label: "Lakshadweep" },
  { value: "delhi", label: "Delhi" },
  { value: "puducherry", label: "Puducherry" },
  { value: "ladakh", label: "Ladakh" },
  { value: "jammu_and_kashmir", label: "Jammu and Kashmir" },
];

export const employeeContributionRate = [
  { value: false, label: "20% of Actual PF Wage" },
  { value: true, label: "Restrict Contribution to ₹15,000 of PF Wage" },
];

export const employerContributionRate = [
  { value: false, label: "20% of Actual PF Wage" },
  { value: true, label: "Restrict Contribution to ₹15,000 of PF Wage" },
];
export const payoutMonths = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

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

export const privacyPolicyData = [
  {
    subject: "Introduction",
    description:
      "This privacy policy explains how we collect, use, and protect your personal information when you use our platform. By accessing or using the platform, you agree to the terms outlined in this policy, which applies to all users regardless of the type of account or interaction with the platform. We are committed to safeguarding your privacy and ensuring that your personal data is processed in accordance with applicable data protection laws. If you do not agree with the terms of this policy, you should immediately stop using the platform. This policy outlines what personal data we collect and why, how we use, store, and secure your data, your rights and how to exercise them regarding your data, how we handle your information when you use our services, and the third parties we may share your data with and under what circumstances.",
  },
  {
    subject: "Information We Collect",
    description:
      "We collect several types of information to provide you with a personalized experience and improve the functionality of our platform. The information we collect includes personal identification details such as name, email address, phone number, and other contact information you provide during account registration. Demographic details, such as age, gender, and location, help us personalize your experience and recommend relevant services. We also collect account-related information, such as your login credentials, profile information, and activity related to your account. Data related to your use of the platform, such as your IP address, browser type, operating system, device information, and log data, is also collected. We gather usage data including information about how you interact with the platform, such as the pages you visit, the features you use, and your search queries. Behavioral data such as click-through rates, time spent on specific pages, and user engagement patterns help us improve the platform’s usability. If you make transactions through the platform, we may collect information related to your payment method, such as credit card or bank account details, although we use third-party payment processors to handle financial data securely. Geolocation data may also be collected to offer location-specific services such as job recommendations or nearby service providers. Communication data is collected when you communicate with us through support tickets, chat functions, or other communication methods, which helps us provide better service and follow up on inquiries. We also use cookies and tracking technologies to collect information about how you use the platform, personalize your experience, and analyze trends to optimize our services.",
  },
  {
    subject: "How We Use Your Information",
    description:
      "We use the information we collect for various purposes. This includes providing services such as creating and managing your user account, allowing you to access the platform’s features and services, such as posting jobs, applying for jobs, or communicating with other users. The information is used to personalize the content you see on the platform, including job recommendations, notifications, and offers that are most relevant to you. We also use your information to improve the platform by analyzing your usage patterns and behavior to enhance its functionality, design, and user experience. This helps us identify areas for improvement and optimize features. We may communicate with you to send important updates regarding your account, such as notifications about security changes, policy updates, or new features. You may receive emails or app notifications about these matters. Your information is also used to respond to inquiries and provide customer support when needed, whether through email, chat, or other channels. For transaction processing, we use the information you provide to process your payments, including for services, subscriptions, or other fees. We work with secure third-party payment processors to handle your financial data safely. For marketing and advertising, we use your data to deliver personalized advertisements and promotional offers based on your activity on the platform. We may use cookies to serve targeted ads on third-party websites or platforms. Additionally, your information may be used for legal and compliance purposes, such as complying with legal obligations, resolving disputes, and enforcing our agreements. This may include sharing data with legal authorities when required by law or when necessary to protect our rights and property. Your information is also used to detect and prevent fraud by monitoring and analyzing usage patterns for potential fraudulent activity or violations of our terms of service.",
  },
  {
    subject: "How We Share Your Information",
    description:
      "We do not sell, rent, or lease your personal information to third parties. However, we may share your information in certain situations. With service providers, we may share your personal data with trusted third-party service providers that assist in operating the platform. These providers may help us with payment processing, hosting services, customer support, or email delivery. These third parties are contractually obligated to safeguard your information and use it only for the purpose of providing the services we request. We may also disclose your personal data if required by law, including for compliance with legal obligations, government requests, or to comply with a subpoena or other legal process. Your data may also be shared to protect our legal rights, safety, or property, or that of others, including in connection with investigations of fraud, illegal activity, or intellectual property violations. In case of business transactions, if we undergo a merger, acquisition, or sale of all or a portion of our assets, your personal information may be transferred as part of that transaction. In such cases, we will inform you of any significant changes to our privacy policy or terms of service. We may share your information with third parties when we have obtained your explicit consent to do so. This may include sharing data with marketing partners or providing you with services that require sharing your information with others. We may also share aggregated, anonymized, or de-identified data with third parties for analysis, research, or marketing purposes. This type of data does not personally identify you and is not linked to your individual account.",
  },
  {
    subject: "Cookies and Tracking Technologies",
    description: `We use cookies and similar tracking technologies to enhance your experience on our platform. Cookies are small data files stored on your device that allow us to remember certain preferences and actions, such as login credentials or language settings. These technologies help us track your activity on the platform, such as which pages you visit, how long you spend on the platform, and which features you use. This helps us understand user preferences and optimize the platform's functionality. Cookies allow us to customize your experience by remembering your preferences, past actions, or previously viewed pages. This enables us to present content that is more relevant to you, such as tailored job recommendations. We also use cookies to analyze trends and track user activity across the platform to identify areas for improvement and provide better services. We may use cookies to deliver personalized advertisements and promotional offers based on your activity on the platform. You can manage your cookie preferences through your browser settings, where you can block or delete cookies if you choose to do so. However, disabling cookies may limit your ability to use certain features or functions of the platform.`,
  },
  {
    subject: "Data Retention",
    description:
      "We retain your personal data for as long as necessary to fulfill the purposes outlined in this privacy policy, including compliance with legal and regulatory requirements. We will securely delete or anonymize your data when it is no longer needed for the purposes it was collected. If you wish to delete your personal information before it reaches the end of its retention period, you can contact us through the support channels available on the platform. We may retain certain data even after your account is deleted if it is required to comply with legal obligations, resolve disputes, or enforce our agreements. The retention period for data may vary depending on the type of data and the purposes for which it was collected. For example, transaction records may be kept longer than basic account information if required by law for tax or accounting purposes.",
  },
  {
    subject: "Data Security",
    description:
      "We implement reasonable security measures to protect your personal data from unauthorized access, disclosure, alteration, or destruction. These measures include encryption, firewalls, secure communication channels, and regular security audits to ensure the platform remains secure. However, no method of data transmission over the internet or electronic storage is 100% secure, and we cannot guarantee the absolute security of your personal data. While we strive to protect your data to the best of our ability, users should also take appropriate precautions to protect their own personal information, such as keeping login credentials confidential and using strong passwords. If we become aware of any security breach involving your personal data, we will notify you promptly and take appropriate steps to address the issue in accordance with applicable laws.",
  },
  {
    subject: "User Rights",
    description:
      "You have the following rights regarding your personal information under applicable data protection laws: The right to access your personal data, which allows you to obtain a copy of the data we hold about you. The right to correct or update any inaccurate or incomplete personal data. The right to delete your personal information, subject to certain conditions, such as compliance with legal obligations or resolving disputes. The right to withdraw consent for the processing of your data, where applicable. The right to object to data processing or restrict processing under certain circumstances, such as when you believe the data is being processed unlawfully. You can exercise these rights by contacting us through the support channels available on the platform. We will respond to your request in accordance with applicable laws and within a reasonable timeframe.",
  },
  {
    subject: "Third-Party Links",
    description:
      "Our platform may contain links to third-party websites that are not operated or controlled by us. We are not responsible for the privacy practices or content of such third-party sites. We encourage you to review their privacy policies before providing any personal information on these external websites. These third-party sites may collect personal information, use cookies, and employ other tracking technologies. Please be aware that the terms of this privacy policy do not apply to third-party websites, and we are not responsible for their actions.",
  },
  {
    subject: "Children's Privacy",
    description:
      "Our platform is not intended for children under the age of 13, and we do not knowingly collect personal information from children under this age. If we learn that we have collected personal information from a child under 13, we will take steps to delete that information as soon as possible. If you believe that we may have collected personal data from a child under 13, please contact us immediately so we can take appropriate action.",
  },
  {
    subject: "Changes to This Policy",
    description:
      "We may update this privacy policy from time to time to reflect changes in our practices, legal requirements, or the services we provide. Any changes to this policy will be posted on this page with an updated effective date. We recommend that you review this policy periodically to stay informed about how we are protecting your information. If we make significant changes to this policy, we will notify you through appropriate channels, such as email or a prominent notice on the platform.",
  },
  {
    subject: "Contact Us",
    description:
      "If you have any questions or concerns about this privacy policy, or if you wish to exercise your rights regarding your personal data, please contact us using the contact information provided on the platform. We are committed to addressing your inquiries and ensuring that your data is handled securely and in accordance with this policy.",
  },
];

export const EMPLOYEE_EPF_PERCENTAGE = 0.12;
export const EMPLOYER_EPF_PERCENTAGE = 0.12;
export const EMPLOYER_EDLI_PERCENTAGE = 0.005;
export const EMPLOYER_EPS_PERCENTAGE = 0.0833;
export const EMPLOYER_ADMIN_CHARGES_PERCENTAGE = 0.005;