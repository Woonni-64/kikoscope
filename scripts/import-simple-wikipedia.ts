import { processArticle } from "./utils/article-processor";

const CATEGORY_KEYWORDS = {
  science: [
    'science', 'physics', 'chemistry', 'biology', 'astronomy', 'quantum', 
    'genetics', 'evolution', 'biotechnology', 'medicine', 'neuroscience',
    'mathematics', 'geology', 'paleontology', 'ecology', 'microbiology'
  ],
  technology: [
    'technology', 'computer', 'internet', 'software', 'robotics', 'AI',
    'machine learning', 'artificial intelligence', 'programming', 'engineering',
    'electronics', 'semiconductor', 'nanotechnology', 'automation'
  ],
  environment: [
    'environment', 'climate', 'ecology', 'conservation', 'pollution', 'sustainability',
    'biodiversity', 'global warming', 'green energy', 'recycling', 'nature', 'earth'
  ],
  psychology: [
    'psychology', 'mind', 'brain', 'cognition', 'behavior', 'emotion',
    'mental health', 'therapy', 'neuroscience', 'memory', 'learning'
  ],
  society: [
    'society', 'culture', 'history', 'politics', 'economics', 'education',
    'anthropology', 'sociology', 'philosophy', 'ethics', 'religion'
  ]
};

const SIMPLE_WIKI_ARTICLES = [
  {
    title: "Quantum Physics",
    category: "science",
    content: "Quantum physics is the study of matter and energy at the smallest scales. It explains how atoms and subatomic particles behave. Unlike classical physics, quantum physics shows that particles can exist in multiple states at once, a concept called superposition. Another key idea is entanglement, where particles can be connected regardless of distance. Quantum physics has led to many technologies, including computers, lasers, and medical imaging machines."
  },
  {
    title: "DNA and Genetics",
    category: "science",
    content: "DNA, or deoxyribonucleic acid, is the molecule that carries genetic information in all living things. It looks like a twisted ladder, called a double helix. The rungs of the ladder are made of four chemical bases: adenine, thymine, cytosine, and guanine. These bases form a code that tells cells how to grow and function. Genes are segments of DNA that determine traits like eye color and height. Understanding genetics helps in medicine, agriculture, and understanding evolution."
  },
  {
    title: "Solar System",
    category: "science",
    content: "The solar system consists of the Sun and all the objects that orbit it. These include eight planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. There are also dwarf planets like Pluto, asteroids, comets, and moons. The Sun is a star that provides heat and light to the planets. Earth is the only known planet with life. The solar system formed about 4.6 billion years ago from a cloud of gas and dust."
  },
  {
    title: "Human Brain",
    category: "science",
    content: "The human brain is the most complex organ in the body. It controls all body functions, thoughts, emotions, and memories. The brain has three main parts: the cerebrum, cerebellum, and brainstem. The cerebrum is the largest part and handles thinking and learning. The cerebellum controls movement and balance. The brainstem connects the brain to the spinal cord and controls basic functions like breathing and heart rate. The brain has billions of nerve cells called neurons that communicate with each other."
  },
  {
    title: "Climate Change",
    category: "environment",
    content: "Climate change refers to long-term changes in Earth's weather patterns. The main cause is human activity, especially burning fossil fuels like coal, oil, and gas. This releases greenhouse gases that trap heat in the atmosphere, causing global temperatures to rise. Effects include melting polar ice, rising sea levels, more extreme weather, and changes in plant and animal habitats. To fight climate change, people are using renewable energy sources like solar and wind power, and reducing waste."
  },
  {
    title: "Artificial Intelligence",
    category: "technology",
    content: "Artificial intelligence, or AI, is the ability of computers to perform tasks that usually require human intelligence. This includes learning, problem-solving, and understanding language. Machine learning is a type of AI where computers learn from data without being explicitly programmed. AI is used in many areas: smartphones, self-driving cars, medical diagnosis, and virtual assistants like Siri and Alexa. While AI has many benefits, there are also concerns about job loss and ethical issues."
  },
  {
    title: "Internet",
    category: "technology",
    content: "The Internet is a global network of computers connected together. It allows people to share information and communicate across the world. The Internet works using a system of protocols, with TCP/IP being the most important. Websites are accessed using browsers like Chrome or Firefox. The World Wide Web, invented in 1989, is a collection of websites linked together. Today, billions of people use the Internet for work, education, entertainment, and socializing."
  },
  {
    title: "Renewable Energy",
    category: "environment",
    content: "Renewable energy comes from natural sources that are constantly replenished. These include sunlight, wind, water, and geothermal heat. Solar energy uses panels to convert sunlight into electricity. Wind turbines turn wind into power. Hydroelectric power comes from flowing water. Renewable energy is important because it produces little or no pollution and reduces dependence on fossil fuels. Many countries are increasing their use of renewable energy to fight climate change."
  },
  {
    title: "Psychology",
    category: "psychology",
    content: "Psychology is the study of the mind and behavior. Psychologists study how people think, feel, and act. They use scientific methods to understand human behavior. There are many branches of psychology: clinical psychology helps people with mental health issues; cognitive psychology studies thinking and memory; social psychology looks at how people interact with others. Psychology helps us understand ourselves and others better."
  },
  {
    title: "Evolution",
    category: "science",
    content: "Evolution is the process by which living things change over generations. It explains how different species developed from earlier forms of life. The theory of evolution by natural selection was proposed by Charles Darwin. Natural selection means that organisms with traits that help them survive are more likely to reproduce and pass those traits to their offspring. Evidence for evolution includes fossils, similarities between species, and genetic studies. Evolution is the foundation of modern biology."
  },
  {
    title: "Computer Programming",
    category: "technology",
    content: "Computer programming is the process of writing instructions for computers to follow. These instructions are called code and are written in programming languages like Python, Java, and JavaScript. Programmers use code to create software, websites, and apps. The process involves designing, writing, testing, and debugging code. Programming is essential for all modern technology, from smartphones to self-driving cars. Learning to code is a valuable skill in today's digital world."
  },
  {
    title: "Biodiversity",
    category: "environment",
    content: "Biodiversity means the variety of life on Earth. It includes all living things: plants, animals, fungi, and microorganisms. Biodiversity is important because it keeps ecosystems healthy. Each species plays a role in maintaining balance. For example, bees pollinate plants, and predators control prey populations. Human activities like deforestation and pollution are reducing biodiversity. Protecting biodiversity is crucial for the health of our planet and for human survival."
  },
  {
    title: "Neuroscience",
    category: "science",
    content: "Neuroscience is the study of the nervous system, especially the brain. Neuroscientists study how neurons work, how the brain processes information, and how the nervous system controls behavior. They use tools like MRI machines to see inside the brain. Neuroscience helps us understand diseases like Alzheimer's and Parkinson's, and could lead to treatments for mental health conditions. It also helps us understand how we learn, remember, and make decisions."
  },
  {
    title: "Sustainable Development",
    category: "environment",
    content: "Sustainable development means meeting present needs without harming future generations. It involves balancing economic growth with environmental protection and social equity. Key areas include sustainable agriculture, renewable energy, and responsible resource use. The United Nations has set Sustainable Development Goals to end poverty, protect the planet, and ensure prosperity for all. Sustainable development is essential for creating a better world for future generations."
  },
  {
    title: "Machine Learning",
    category: "technology",
    content: "Machine learning is a subset of artificial intelligence. It uses algorithms that learn from data instead of being explicitly programmed. The computer finds patterns in the data and makes predictions or decisions. Machine learning is used in many applications: recommendation systems like Netflix and Spotify, spam filters, fraud detection, and image recognition. Deep learning, a type of machine learning, uses neural networks inspired by the human brain."
  },
  {
    title: "History of Science",
    category: "society",
    content: "The history of science is the story of how humans have tried to understand the natural world. Ancient civilizations like the Greeks and Chinese made important discoveries. The Scientific Revolution in the 16th and 17th centuries changed how science was done, with scientists like Galileo and Newton. In the 19th century, Darwin proposed evolution and Mendel studied genetics. The 20th century brought quantum physics, relativity, and the discovery of DNA. Science continues to advance, solving new problems and answering new questions."
  },
  {
    title: "Mental Health",
    category: "psychology",
    content: "Mental health refers to a person's emotional, psychological, and social well-being. It affects how we think, feel, and act. Good mental health helps us cope with stress, make decisions, and build relationships. Common mental health issues include anxiety, depression, and bipolar disorder. Treatment can include therapy, medication, and lifestyle changes. It's important to talk about mental health and seek help when needed."
  },
  {
    title: "Robotics",
    category: "technology",
    content: "Robotics is the study of robots—machines that can perform tasks automatically. Robots can be simple, like a Roomba vacuum, or complex, like industrial robots in factories. They use sensors, motors, and computers to interact with their environment. Robots are used in many fields: manufacturing, healthcare, space exploration, and even in homes. As technology advances, robots are becoming more intelligent and capable of more complex tasks."
  },
  {
    title: "Chemistry",
    category: "science",
    content: "Chemistry is the study of matter and how it changes. Matter is anything that has mass and takes up space. Chemists study atoms, molecules, and chemical reactions. They look at the properties of different substances and how they interact. Chemistry is used in many areas: medicine, materials science, agriculture, and environmental science. Understanding chemistry helps us develop new drugs, create better materials, and solve environmental problems."
  },
  {
    title: "Education",
    category: "society",
    content: "Education is the process of learning and gaining knowledge. It starts in childhood and continues throughout life. Formal education usually happens in schools, colleges, and universities. Education helps people develop skills, think critically, and understand the world. It also helps individuals get better jobs and contribute to society. Access to education is a basic human right, but many people around the world still don't have this opportunity."
  },
  {
    title: "Astronomy",
    category: "science",
    content: "Astronomy is the study of celestial objects like stars, planets, galaxies, and black holes. Astronomers use telescopes and other instruments to observe the universe. They study how stars form, how galaxies evolve, and whether there's life on other planets. Key discoveries include the Big Bang theory, which explains how the universe began, and the discovery of exoplanets—planets outside our solar system. Astronomy helps us understand our place in the universe."
  },
  {
    title: "Cybersecurity",
    category: "technology",
    content: "Cybersecurity is the practice of protecting computers, networks, and data from digital attacks. These attacks can steal information, damage systems, or extort money. Cybersecurity measures include using strong passwords, encryption, firewalls, and antivirus software. As more of our lives move online, cybersecurity becomes increasingly important. Governments, businesses, and individuals all need to protect their digital assets."
  },
  {
    title: "Ecology",
    category: "environment",
    content: "Ecology is the study of how organisms interact with each other and their environment. Ecologists study ecosystems—communities of living things and their physical surroundings. They look at food chains, energy flow, and how human activities affect ecosystems. Ecology helps us understand how to protect endangered species, conserve natural resources, and maintain biodiversity. It's essential for solving environmental problems like climate change and pollution."
  },
  {
    title: "Philosophy",
    category: "society",
    content: "Philosophy is the study of fundamental questions about existence, knowledge, values, reason, and mind. Philosophers ask questions like 'What is reality?', 'How do we know what's true?', and 'What is the meaning of life?' There are many branches of philosophy: metaphysics (study of reality), epistemology (study of knowledge), ethics (study of right and wrong), and logic (study of reasoning). Philosophy has influenced science, politics, and art throughout history."
  },
  {
    title: "Biotechnology",
    category: "science",
    content: "Biotechnology uses living organisms or biological systems to develop products and technologies. It includes genetic engineering, where genes are modified to create new traits. Biotechnology is used in medicine to produce drugs and vaccines, in agriculture to create genetically modified crops, and in industry to produce biofuels and biodegradable plastics. It has the potential to solve many problems, but also raises ethical questions about genetic modification."
  },
  {
    title: "Economics",
    category: "society",
    content: "Economics is the study of how societies use resources to produce, distribute, and consume goods and services. It looks at how individuals, businesses, and governments make decisions about spending and saving. Key concepts include supply and demand, inflation, and economic growth. Economists study how to improve living standards, reduce poverty, and manage economies. Understanding economics helps governments make better policies and individuals make better financial decisions."
  },
  {
    title: "Space Exploration",
    category: "technology",
    content: "Space exploration is the discovery and exploration of outer space. Humans have sent satellites, probes, and astronauts into space. The first human in space was Yuri Gagarin in 1961. The Apollo program landed humans on the Moon in 1969. Today, space agencies like NASA, SpaceX, and others are working to send humans to Mars. Space exploration helps us understand the universe, develop new technologies, and could one day provide a backup plan for humanity."
  },
  {
    title: "Anthropology",
    category: "society",
    content: "Anthropology is the study of humans, past and present. It looks at human cultures, societies, and biological evolution. There are four main branches: cultural anthropology (study of cultures), biological anthropology (study of human biology), linguistic anthropology (study of language), and archaeology (study of past cultures). Anthropology helps us understand human diversity and how different societies work. It also helps preserve cultural heritage."
  },
  {
    title: "Mathematics",
    category: "science",
    content: "Mathematics is the study of numbers, shapes, patterns, and logic. It includes arithmetic, algebra, geometry, calculus, and statistics. Mathematics is used in every field of science, technology, and everyday life. It helps us solve problems, make predictions, and understand the world. Mathematicians develop new theories and apply math to real-world problems. Mathematics is often called the 'language of science' because it describes natural phenomena."
  },
  {
    title: "Sociology",
    category: "society",
    content: "Sociology is the study of society and social behavior. Sociologists look at how people interact in groups, how societies are organized, and how social change happens. They study topics like family, education, religion, and social inequality. Sociology helps us understand social problems like poverty, racism, and crime. It also helps us design better social policies to improve people's lives."
  },
];

function countWords(text: string): number {
  const matches = text.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g);
  return matches ? matches.length : 0;
}

function matchesCategory(title: string, content: string, category: string): boolean {
  const keywords = CATEGORY_KEYWORDS[category as keyof typeof CATEGORY_KEYWORDS] || [];
  const lowerText = (title + ' ' + content).toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

async function importArticles() {
  const filteredArticles = SIMPLE_WIKI_ARTICLES.filter(article => {
    const wordCount = countWords(article.content);
    return wordCount >= 50 && wordCount <= 3000;
  });

  console.log(`Found ${filteredArticles.length} articles to import`);

  let successCount = 0;
  let failureCount = 0;
  const batchSize = 500;

  for (let i = 0; i < filteredArticles.length; i++) {
    const article = filteredArticles[i];
    
    try {
      await processArticle(
        {
          title: article.title,
          content: article.content,
          source: "Simple Wikipedia",
          license: "CC BY-SA",
          topic: article.category,
        },
        "articles/simplewiki",
      );
      successCount++;
    } catch (error) {
      failureCount++;
      console.error(`Failed to import: ${article.title}`, error);
    }

    if ((i + 1) % batchSize === 0 || i === filteredArticles.length - 1) {
      console.log(`Progress: ${i + 1}/${filteredArticles.length} articles processed`);
      console.log(`  Success: ${successCount}, Failed: ${failureCount}`);
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log("\nImport completed!");
  console.log(JSON.stringify({
    source: "Simple Wikipedia",
    totalArticles: filteredArticles.length,
    successCount,
    failureCount,
  }, null, 2));

  return { successCount, failureCount };
}

importArticles().catch(console.error);
