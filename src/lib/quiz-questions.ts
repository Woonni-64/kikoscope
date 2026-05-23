export type Question = {
  question: string;
  options: string[];
  correctAnswer: number;
};

export type QuizQuestions = {
  [slug: string]: Question[];
};

export const quizQuestions: QuizQuestions = {
  "gaokao-small-habits": [
    {
      question: "What is the main idea of the passage?",
      options: [
        "A) Writing is only important for academic success",
        "B) Writing helps people connect and understand each other",
        "C) Students should write about health-related topics",
        "D) Teachers should assign more essays"
      ],
      correctAnswer: 1
    },
    {
      question: "Why were students' first essays disappointing?",
      options: [
        "A) They didn't understand the topic",
        "B) The question 'Why is writing important?' was not engaging enough",
        "C) They lacked writing skills",
        "D) They were lazy"
      ],
      correctAnswer: 1
    },
    {
      question: "What happened when students were asked to write about health topics?",
      options: [
        "A) They refused to participate",
        "B) They performed worse than before",
        "C) They found it more interesting and wrote more",
        "D) They only wrote one page"
      ],
      correctAnswer: 2
    },
    {
      question: "What does the author mean by 'the ability to connect people'?",
      options: [
        "A) Writing helps people travel",
        "B) Writing allows people to understand others' perspectives",
        "C) Writing is only for entertainment",
        "D) Writing is a job skill"
      ],
      correctAnswer: 1
    },
    {
      question: "What is the author's attitude toward writing?",
      options: [
        "A) Indifferent",
        "B) Negative",
        "C) Very positive and passionate",
        "D) Confused"
      ],
      correctAnswer: 2
    }
  ],
  "cet-renewable-energy": [
    {
      question: "What is the main topic of the passage?",
      options: [
        "A) The history of fossil fuels",
        "B) Renewable energy solutions for climate change",
        "C) The cost of electricity",
        "D) Why cars should be banned"
      ],
      correctAnswer: 1
    },
    {
      question: "According to the passage, why is renewable energy important?",
      options: [
        "A) It's cheaper than fossil fuels",
        "B) It helps reduce carbon emissions",
        "C) It's easier to produce",
        "D) It's more reliable"
      ],
      correctAnswer: 1
    },
    {
      question: "What can be inferred about the future of renewable energy?",
      options: [
        "A) It will replace fossil fuels completely",
        "B) It will become increasingly important",
        "C) It will be abandoned",
        "D) It will remain experimental"
      ],
      correctAnswer: 1
    },
    {
      question: "What does the word 'sustainable' mean in this context?",
      options: [
        "A) Something that can be maintained at a steady level without depleting resources",
        "B) Something very expensive",
        "C) Something that can be used once",
        "D) Something from nature"
      ],
      correctAnswer: 0
    },
    {
      question: "Which of the following is NOT mentioned as a renewable energy source?",
      options: [
        "A) Solar power",
        "B) Wind power",
        "C) Natural gas",
        "D) Hydroelectric power"
      ],
      correctAnswer: 2
    }
  ],
  "cet-smart-libraries": [
    {
      question: "What is the main idea of the passage?",
      options: [
        "A) Libraries are no longer needed",
        "B) Modern libraries are adapting to digital age while maintaining their core mission",
        "C) All books should be digitized",
        "D) Libraries should only serve students"
      ],
      correctAnswer: 1
    },
    {
      question: "How are modern libraries changing?",
      options: [
        "A) They are closing down",
        "B) They are becoming community centers with digital services",
        "C) They are only keeping old books",
        "D) They are removing all librarians"
      ],
      correctAnswer: 1
    },
    {
      question: "What role do librarians play in modern libraries?",
      options: [
        "A) They only organize books",
        "B) They help people navigate digital resources and provide expertise",
        "C) They are being replaced by machines",
        "D) They no longer help visitors"
      ],
      correctAnswer: 1
    },
    {
      question: "What can be inferred about traditional libraries?",
      options: [
        "A) They will completely disappear",
        "B) They are evolving to include technology",
        "C) They refuse to change",
        "D) They only exist in big cities"
      ],
      correctAnswer: 1
    },
    {
      question: "What is the author's attitude toward modern libraries?",
      options: [
        "A) Pessimistic",
        "B) Optimistic and supportive",
        "C) Indifferent",
        "D) Critical"
      ],
      correctAnswer: 1
    }
  ],
  "ielts-digital-revolution": [
    {
      question: "What is the main topic of the passage?",
      options: [
        "A) The dangers of technology",
        "B) How digital technology is transforming education",
        "C) Why students should stop using phones",
        "D) The history of computers"
      ],
      correctAnswer: 1
    },
    {
      question: "According to the passage, how is technology affecting learning?",
      options: [
        "A) Making it more difficult",
        "B) Making it more accessible and interactive",
        "C) Replacing teachers entirely",
        "D) Reducing the need for books"
      ],
      correctAnswer: 1
    },
    {
      question: "What can be inferred about future education?",
      options: [
        "A) It will rely entirely on AI",
        "B) Technology will play an increasingly important role",
        "C) Traditional methods will remain the only approach",
        "D) Students will stop going to school"
      ],
      correctAnswer: 1
    },
    {
      question: "What does the word 'interactive' mean in this context?",
      options: [
        "A) Allowing two-way communication or participation",
        "B) Being very modern",
        "C) Being expensive",
        "D) Using a lot of electricity"
      ],
      correctAnswer: 0
    },
    {
      question: "Which of the following is mentioned as a benefit of digital learning?",
      options: [
        "A) Students can learn at any time and place",
        "B) It costs more than traditional learning",
        "C) It requires more physical textbooks",
        "D) It eliminates the need for teachers"
      ],
      correctAnswer: 0
    }
  ],
  "ielts-urban-nature": [
    {
      question: "What is the main idea of the passage?",
      options: [
        "A) Cities should remove all green spaces",
        "B) Access to nature in cities is important for residents' well-being",
        "C) Parks are only for recreation",
        "D) Urban planning should focus only on buildings"
      ],
      correctAnswer: 1
    },
    {
      question: "According to the passage, why are green spaces important?",
      options: [
        "A) They increase property values",
        "B) They provide mental and physical health benefits",
        "C) They are required by law",
        "D) They attract tourists"
      ],
      correctAnswer: 1
    },
    {
      question: "What can be inferred about city planners?",
      options: [
        "A) They should prioritize green spaces in urban design",
        "B) They should only focus on transportation",
        "C) They should remove all trees",
        "D) They should build more parking lots"
      ],
      correctAnswer: 0
    },
    {
      question: "What does the word 'resilience' mean in this context?",
      options: [
        "A) The ability to recover quickly from difficulties",
        "B) Being very strong",
        "C) Being expensive",
        "D) Being green"
      ],
      correctAnswer: 0
    },
    {
      question: "What is the author's attitude toward urban green spaces?",
      options: [
        "A) They are unnecessary",
        "B) They are essential for healthy cities",
        "C) They should be minimized",
        "D) They are only for wealthy neighborhoods"
      ],
      correctAnswer: 1
    }
  ],
  "gaokao-microplastics": [
    {
      question: "What is the main topic of the passage?",
      options: [
        "A) The dangers of plastic bags",
        "B) Microplastics pollution and its impact on the environment",
        "C) How to recycle plastic",
        "D) Why we should use more plastic"
      ],
      correctAnswer: 1
    },
    {
      question: "What are microplastics?",
      options: [
        "A) Large pieces of plastic",
        "B) Tiny plastic particles that can enter ecosystems",
        "C) Plastic that can be easily recycled",
        "D) Biodegradable plastic alternatives"
      ],
      correctAnswer: 1
    },
    {
      question: "According to the passage, where can microplastics be found?",
      options: [
        "A) Only in oceans",
        "B) In oceans, soil, and even drinking water",
        "C) Only in developed countries",
        "D) Only in factories"
      ],
      correctAnswer: 1
    },
    {
      question: "What can be inferred about microplastics pollution?",
      options: [
        "A) It's an easy problem to solve",
        "B) It's a widespread and serious environmental issue",
        "C) It only affects marine life",
        "D) It's not a real concern"
      ],
      correctAnswer: 1
    },
    {
      question: "What does the word 'persistent' mean in this context?",
      options: [
        "A) Disappearing quickly",
        "B) Remaining in the environment for a long time",
        "C) Being very small",
        "D) Being harmless"
      ],
      correctAnswer: 1
    }
  ],
  "guardian-climate-change": [
    {
      question: "What is the main topic of the passage?",
      options: [
        "A) The economic benefits of climate change",
        "B) The urgent need to address climate change and its effects",
        "C) Why climate change is a hoax",
        "D) How to increase industrial production"
      ],
      correctAnswer: 1
    },
    {
      question: "According to the passage, what are the effects of climate change?",
      options: [
        "A) Only rising temperatures",
        "B) Extreme weather, rising sea levels, and ecosystem disruptions",
        "C) Only economic growth",
        "D) Only affecting polar bears"
      ],
      correctAnswer: 1
    },
    {
      question: "What can be inferred about climate action?",
      options: [
        "A) It's unnecessary",
        "B) Immediate and collective action is needed",
        "C) Only governments should act",
        "D) It's too late to do anything"
      ],
      correctAnswer: 1
    },
    {
      question: "What does the word 'mitigation' mean in this context?",
      options: [
        "A) Making something worse",
        "B) Reducing the severity of climate change",
        "C) Ignoring the problem",
        "D) Blaming someone"
      ],
      correctAnswer: 1
    },
    {
      question: "What is the author's attitude toward climate change?",
      options: [
        "A) Dismissive",
        "B) Alarmed and calling for action",
        "C) Indifferent",
        "D) Supportive of inaction"
      ],
      correctAnswer: 1
    }
  ],
  "bbc-english-language-day": [
    {
      question: "What is the main idea of the passage?",
      options: [
        "A) English is the only important language",
        "B) English language learning should be more accessible worldwide",
        "C) Only native speakers should teach English",
        "D) English is losing its importance"
      ],
      correctAnswer: 1
    },
    {
      question: "According to the passage, why is English important?",
      options: [
        "A) It's the easiest language to learn",
        "B) It's a global language for international communication",
        "C) It's required for immigration",
        "D) It's the oldest language"
      ],
      correctAnswer: 1
    },
    {
      question: "What can be inferred about English education?",
      options: [
        "A) It's only available in wealthy countries",
        "B) It should be made more accessible to underserved communities",
        "C) It's no longer necessary",
        "D) It should be mandatory for everyone"
      ],
      correctAnswer: 1
    },
    {
      question: "What does the word 'inclusive' mean in this context?",
      options: [
        "A) Excluding certain groups",
        "B) Open and accessible to all people",
        "C) Very expensive",
        "D) Only for native speakers"
      ],
      correctAnswer: 1
    },
    {
      question: "What is the author's attitude toward English education?",
      options: [
        "A) Negative - it should be stopped",
        "B) Supportive of making it more accessible",
        "C) Indifferent",
        "D) Only supportive for native speakers"
      ],
      correctAnswer: 1
    }
  ],
  "bbc-international-workers-day": [
    {
      question: "What is the main topic of the passage?",
      options: [
        "A) The history of trade unions",
        "B) Workers' rights and the importance of Labor Day",
        "C) Why people should work more hours",
        "D) The dangers of having holidays"
      ],
      correctAnswer: 1
    },
    {
      question: "According to the passage, why are workers' rights important?",
      options: [
        "A) They only benefit employers",
        "B) They ensure fair treatment, safe conditions, and reasonable hours",
        "C) They are not necessary",
        "D) They only apply to certain workers"
      ],
      correctAnswer: 1
    },
    {
      question: "What can be inferred about labor movements?",
      options: [
        "A) They have achieved significant improvements for workers",
        "B) They are no longer needed",
        "C) They only cause problems",
        "D) They should be abolished"
      ],
      correctAnswer: 0
    },
    {
      question: "What does the word 'solidarity' mean in this context?",
      options: [
        "A) Competition between workers",
        "B) Unity and support among workers",
        "C) Working alone",
        "D) Following orders"
      ],
      correctAnswer: 1
    },
    {
      question: "What is the author's attitude toward workers' rights?",
      options: [
        "A) Opposed to them",
        "B) Supportive and respectful",
        "C) Indifferent",
        "D) They should be removed"
      ],
      correctAnswer: 1
    }
  ],
  "nyt-happiness-health": [
    {
      question: "What is the main topic of the passage?",
      options: [
        "A) Money is the key to happiness",
        "B) The relationship between happiness and physical health",
        "C) Why people should work harder",
        "D) The dangers of exercise"
      ],
      correctAnswer: 1
    },
    {
      question: "According to the passage, what is the connection between happiness and health?",
      options: [
        "A) Happy people are always healthier",
        "B) Happiness can positively influence physical health outcomes",
        "C) Health has no connection to happiness",
        "D) Only rich people can be healthy"
      ],
      correctAnswer: 1
    },
    {
      question: "What can be inferred about the research mentioned?",
      options: [
        "A) It's not scientifically valid",
        "B) It suggests happiness has measurable effects on health",
        "C) It only applies to certain people",
        "D) It's a new discovery"
      ],
      correctAnswer: 1
    },
    {
      question: "What does the word 'wellbeing' mean in this context?",
      options: [
        "A) Economic status",
        "B) Overall health, happiness, and prosperity",
        "C) Physical appearance",
        "D) Social media presence"
      ],
      correctAnswer: 1
    },
    {
      question: "What is the author's attitude toward the happiness-health connection?",
      options: [
        "A) Skeptical",
        "B) Believes the research shows a real connection",
        "C) Indifferent",
        "D) Dismissive of the topic"
      ],
      correctAnswer: 1
    }
  ],
  "nyt-flying-taxis": [
    {
      question: "What is the main topic of the passage?",
      options: [
        "A) The dangers of flying",
        "B) The development of flying taxis as future transportation",
        "C) Why cars are better than planes",
        "D) The history of aviation"
      ],
      correctAnswer: 1
    },
    {
      question: "According to the passage, what are flying taxis?",
      options: [
        "A) Science fiction that will never exist",
        "B) Electric aircraft being developed for urban transportation",
        "C) Traditional helicopters",
        "D) Expensive private jets"
      ],
      correctAnswer: 1
    },
    {
      question: "What can be inferred about the future of transportation?",
      options: [
        "A) It will remain the same",
        "B) It may include innovative solutions like flying taxis",
        "C) Cars will completely disappear",
        "D) Planes will never be used"
      ],
      correctAnswer: 1
    },
    {
      question: "What does the word 'commute' mean in this context?",
      options: [
        "A) Traveling to and from work or regular destinations",
        "B) Flying internationally",
        "C) Driving recklessly",
        "D) Walking long distances"
      ],
      correctAnswer: 0
    },
    {
      question: "What is the author's attitude toward flying taxis?",
      options: [
        "A) Dismissive - they will never work",
        "B) Intrigued and optimistic about their potential",
        "C) Indifferent",
        "D) Opposed to the technology"
      ],
      correctAnswer: 1
    }
  ],
  "healthcare-innovations-1776413592736": [
    {
      question: "What is the main topic of the passage?",
      options: [
        "A) Why healthcare is too expensive",
        "B) New technologies transforming healthcare delivery",
        "C) The history of medicine",
        "D) Why hospitals should close"
      ],
      correctAnswer: 1
    },
    {
      question: "According to the passage, how is technology changing healthcare?",
      options: [
        "A) Making it more expensive",
        "B) Enabling remote consultations and better diagnosis",
        "C) Reducing the number of doctors",
        "D) Making it less accessible"
      ],
      correctAnswer: 1
    },
    {
      question: "What can be inferred about telemedicine?",
      options: [
        "A) It's not effective",
        "B) It's becoming an important part of healthcare",
        "C) It will replace all doctors",
        "D) It's only for emergencies"
      ],
      correctAnswer: 1
    },
    {
      question: "What does the word 'accessible' mean in this context?",
      options: [
        "A) Very expensive",
        "B) Easy to reach or obtain",
        "C) Only for specialists",
        "D) Located far away"
      ],
      correctAnswer: 1
    },
    {
      question: "What is the author's attitude toward healthcare innovation?",
      options: [
        "A) Pessimistic",
        "B) Supportive and optimistic",
        "C) Indifferent",
        "D) Opposed to any changes"
      ],
      correctAnswer: 1
    }
  ],
  "the-future-of-education-1776413591363": [
    {
      question: "What is the main topic of the passage?",
      options: [
        "A) Traditional education is the only way",
        "B) How education is evolving with technology and new methodologies",
        "C) Schools should be abolished",
        "D) Teachers are no longer needed"
      ],
      correctAnswer: 1
    },
    {
      question: "According to the passage, what is changing in education?",
      options: [
        "A) Nothing is changing",
        "B) Learning methods, technology integration, and personalized approaches",
        "C) Only exams are changing",
        "D) Education is becoming more expensive"
      ],
      correctAnswer: 1
    },
    {
      question: "What can be inferred about the future of learning?",
      options: [
        "A) It will be exactly the same as before",
        "B) It will be more flexible and technology-enhanced",
        "C) Students will stop learning",
        "D) Only theory will be taught"
      ],
      correctAnswer: 1
    },
    {
      question: "What does the word 'personalized' mean in this context?",
      options: [
        "A) One-size-fits-all approach",
        "B) Tailored to individual needs and abilities",
        "C) Only for gifted students",
        "D) Standardized for everyone"
      ],
      correctAnswer: 1
    },
    {
      question: "What is the author's attitude toward educational change?",
      options: [
        "A) Opposed to any changes",
        "B) Supportive of innovation in education",
        "C) Indifferent",
        "D) Technology is the only solution"
      ],
      correctAnswer: 1
    }
  ],
  "technology-trends-in-2026-1776413589938": [
    {
      question: "What is the main topic of the passage?",
      options: [
        "A) Technology is harmful to society",
        "B) Emerging technology trends shaping various industries",
        "C) Why old technology is better",
        "D) We should stop using technology"
      ],
      correctAnswer: 1
    },
    {
      question: "According to the passage, how is AI affecting different industries?",
      options: [
        "A) It's causing job losses everywhere",
        "B) It's transforming processes and creating new opportunities",
        "C) It has no impact",
        "D) It's only for tech companies"
      ],
      correctAnswer: 1
    },
    {
      question: "What can be inferred about the pace of technological change?",
      options: [
        "A) It's slowing down",
        "B) It's accelerating rapidly",
        "C) It has stopped",
        "D) It's the same as before"
      ],
      correctAnswer: 1
    },
    {
      question: "What does the word 'disruption' mean in this context?",
      options: [
        "A) Making something better slowly",
        "B) Significant change that challenges existing systems",
        "C) No change at all",
        "D) Following tradition"
      ],
      correctAnswer: 1
    },
    {
      question: "What is the author's attitude toward technology trends?",
      options: [
        "A) Fearful and opposed",
        "B) Observant and analytical",
        "C) Indifferent",
        "D) Technology will solve all problems"
      ],
      correctAnswer: 1
    }
  ]
};

export const getDefaultQuestions = (): Question[] => [
  {
    question: "What is the main idea of the passage?",
    options: [
      "A) The importance of physical books in the digital age",
      "B) The history of libraries",
      "C) The advantages of e-readers",
      "D) How to choose reading materials"
    ],
    correctAnswer: 0
  },
  {
    question: "According to the passage, why do some people prefer physical books?",
    options: [
      "A) They are cheaper than e-books",
      "B) They provide tactile satisfaction",
      "C) They are easier to carry",
      "D) They contain more information"
    ],
    correctAnswer: 1
  },
  {
    question: "What can be inferred from the passage?",
    options: [
      "A) Digital reading will completely replace paper reading",
      "B) Physical books will continue to exist alongside digital formats",
      "C) Libraries will disappear in the future",
      "D) Young people no longer read physical books"
    ],
    correctAnswer: 1
  },
  {
    question: "What is the author's attitude toward the topic?",
    options: [
      "A) Indifferent",
      "B) Negative",
      "C) Positive",
      "D) Confused"
    ],
    correctAnswer: 2
  },
  {
    question: "Which of the following is NOT mentioned in the passage?",
    options: [
      "A) A relevant detail from the text",
      "B) Another relevant detail",
      "C) Something not discussed in the text",
      "D) A key point from the passage"
    ],
    correctAnswer: 2
  }
];
