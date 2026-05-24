import { loadEnvLocal } from "./utils/load-env";
import { processArticle } from "./utils/article-processor";

loadEnvLocal();

const TOPICS = [
  { name: "Science", category: "Science", count: 30 },
  { name: "Technology", category: "Technology", count: 30 },
  { name: "Environment", category: "Environment", count: 30 },
  { name: "Psychology", category: "Psychology", count: 30 },
];

const SCIENCE_ARTICLES = [
  { title: "The Wonders of Quantum Physics", content: "Quantum physics is a fundamental theory in physics that describes nature at the smallest scales of energy levels of atoms and subatomic particles. It is the foundation of all quantum technologies including quantum computing, quantum cryptography, and quantum sensors. The theory was developed in the early 20th century by physicists such as Max Planck, Niels Bohr, and Albert Einstein. Quantum mechanics introduces concepts like superposition, entanglement, and wave-particle duality that challenge classical intuitions about how the universe works." },
  { title: "Understanding DNA and Genetics", content: "Deoxyribonucleic acid (DNA) is a molecule composed of two polynucleotide chains that coil around each other to form a double helix carrying genetic instructions for the development, functioning, growth and reproduction of all known organisms and many viruses. DNA and ribonucleic acid (RNA) are nucleic acids. Alongside proteins, lipids and complex carbohydrates (polysaccharides), nucleic acids are one of the four major types of macromolecules essential for all known forms of life." },
  { title: "The Evolution of Stars", content: "Stars are born within the clouds of dust and scattered throughout most galaxies. A familiar example of such as a dust cloud is the Orion Nebula. Turbulence deep within these clouds gives rise to knots with sufficient mass that the gas and dust can begin to collapse under its own gravitational attraction. As the cloud collapses, the material at the center begins to heat up. Known as a protostar, it is this hot core at the heart of the collapsing cloud that will one day become a star." },
  { title: "The Human Brain: A Complex Organ", content: "The human brain is the central organ of the human nervous system, and with the spinal cord makes up the central nervous system. The brain consists of the cerebrum, the brainstem and the cerebellum. It controls most of the activities of the body, processing, integrating, and coordinating the information it receives from the sense organs, and making decisions as to the instructions sent to the rest of the body." },
  { title: "Exploring the Solar System", content: "The Solar System is the gravitationally bound system of the Sun and the objects that orbit it, either directly or indirectly. Of the objects that orbit the Sun directly, the largest are the eight planets, with the remainder being smaller objects, the dwarf planets and small Solar System bodies. The Solar System formed 4.6 billion years ago from the gravitational collapse of a giant interstellar molecular cloud." },
  { title: "The Science of Climate Change", content: "Climate change refers to long-term shifts in temperatures and weather patterns. These shifts may be natural, such as through variations in the solar cycle. But since the 1800s, human activities have been the main driver of climate change, primarily due to burning fossil fuels like coal, oil and gas. Burning fossil fuels generates greenhouse gas emissions that act like a blanket wrapped around the Earth, trapping the sun's heat and raising temperatures." },
  { title: "Advances in Medical Research", content: "Medical research is essential for improving human health and treating diseases. Recent advances include gene editing technologies like CRISPR-Cas9, immunotherapy for cancer treatment, and personalized medicine. These innovations have revolutionized how we understand and treat various medical conditions. Researchers continue to explore new frontiers in areas like regenerative medicine, artificial organs, and digital health technologies." },
  { title: "The Mysteries of Black Holes", content: "A black hole is a region of spacetime where gravity is so strong that nothing—no particles or even electromagnetic radiation such as light—can escape from it. The theory of general relativity predicts that a sufficiently compact mass can deform spacetime to form a black hole. The boundary of no escape is called the event horizon. Although it has an enormous effect on the fate and circumstances of an object crossing it, according to general relativity it has no locally detectable features." },
];

const TECHNOLOGY_ARTICLES = [
  { title: "Artificial Intelligence and Machine Learning", content: "Artificial intelligence (AI) is the simulation of human intelligence processes by machines, especially computer systems. These processes include learning, reasoning, and self-correction. Machine learning (ML) is a subset of AI that involves the use of algorithms to learn from data and make predictions. Deep learning, a further subset, uses neural networks with multiple layers to process complex patterns." },
  { title: "The Future of Renewable Energy", content: "Renewable energy is energy that is collected from renewable resources that are naturally replenished on a human timescale. It includes sources such as sunlight, wind, rain, tides, waves, and geothermal heat. Renewable energy often provides energy in four important areas: electricity generation, air and water heating/cooling, transportation, and rural (off-grid) energy services." },
  { title: "Cybersecurity in the Digital Age", content: "Cybersecurity refers to the practice of protecting systems, networks, and programs from digital attacks. These cyberattacks are usually aimed at accessing, changing, or destroying sensitive information; extorting money from users; or interrupting normal business processes. Implementing effective cybersecurity measures is particularly challenging today because there are more devices than people, and attackers are becoming more innovative." },
  { title: "5G Technology and Its Impact", content: "5G is the fifth generation of wireless technology, succeeding 4G. It promises faster speeds, lower latency, and more reliable connections. 5G technology is expected to enable new applications such as autonomous vehicles, smart cities, and the Internet of Things (IoT). The technology uses higher frequency radio waves and advanced antenna technologies to deliver these improvements." },
  { title: "The Internet of Things (IoT)", content: "The Internet of Things (IoT) describes the network of physical objects—'things'—that are embedded with sensors, software, and other technologies for the purpose of connecting and exchanging data with other devices and systems over the Internet. These devices range from ordinary household objects to sophisticated industrial tools." },
  { title: "Blockchain and Cryptocurrency", content: "Blockchain is a distributed database that maintains a continuously growing list of records called blocks. Each block contains a cryptographic hash of the previous block, a timestamp, and transaction data. Cryptocurrencies like Bitcoin use blockchain technology to enable secure, decentralized transactions without the need for a central authority." },
  { title: "Cloud Computing Explained", content: "Cloud computing is the delivery of computing services—including servers, storage, databases, networking, software, analytics, and intelligence—over the Internet ('the cloud') to offer faster innovation, flexible resources, and economies of scale. You typically pay only for cloud services you use, helping lower your operating costs, run your infrastructure more efficiently, and scale as your business needs change." },
  { title: "Virtual Reality and Augmented Reality", content: "Virtual reality (VR) is a simulated experience that can be similar to or completely different from the real world. Applications of virtual reality include entertainment, education, and business. Augmented reality (AR) overlays digital information on the real world, enhancing the user's perception and interaction with their environment." },
];

const ENVIRONMENT_ARTICLES = [
  { title: "Protecting Endangered Species", content: "Endangered species are plants and animals that are at risk of becoming extinct. Conservation efforts aim to protect these species and their habitats. This includes establishing protected areas, implementing breeding programs, and reducing threats like habitat destruction, pollution, and climate change. Protecting biodiversity is essential for maintaining healthy ecosystems." },
  { title: "Sustainable Agriculture Practices", content: "Sustainable agriculture is farming in sustainable ways meeting society's present food and textile needs, without compromising the ability for current or future generations to meet their needs. It can be based on an understanding of ecosystem services. There are many methods to increase sustainability of agriculture. When developing agriculture within sustainable food systems, it is important to develop flexible business process and farming practices." },
  { title: "The Importance of Biodiversity", content: "Biodiversity refers to the variety of life on Earth at all levels, from genes to ecosystems. It includes the diversity within species, between species, and of ecosystems. Biodiversity provides essential ecosystem services such as pollination, water purification, and climate regulation. Protecting biodiversity is crucial for maintaining ecological balance and ensuring the survival of all species." },
  { title: "Reducing Plastic Pollution", content: "Plastic pollution is the accumulation of plastic objects and particles in the Earth's environment that adversely affects wildlife, wildlife habitat, and humans. Plastics that act as pollutants are categorized by size into micro-, meso-, or macro debris. Plastic pollution can afflict land, waterways and oceans. Living organisms, particularly marine animals, can be harmed either by mechanical effects, such as entanglement in plastic objects or problems related to ingestion of plastic waste." },
  { title: "Renewable Resources Management", content: "Renewable resources are natural resources that can be replenished naturally over time. These include solar energy, wind energy, water, and forests. Sustainable management of renewable resources ensures that they are used in a way that meets present needs without compromising future generations' ability to meet their own needs. This involves practices like sustainable forestry, responsible water usage, and promoting renewable energy sources." },
  { title: "Climate Change Mitigation Strategies", content: "Climate change mitigation refers to actions taken to reduce greenhouse gas emissions or enhance carbon sinks to limit global temperature increase. Strategies include transitioning to renewable energy, improving energy efficiency, promoting sustainable agriculture, and protecting forests. International cooperation through agreements like the Paris Agreement plays a crucial role in coordinating global mitigation efforts." },
  { title: "Ecosystem Restoration", content: "Ecosystem restoration is the process of assisting the recovery of an ecosystem that has been degraded, damaged, or destroyed. Restoration activities may include reforestation, removing invasive species, restoring wetlands, and reintroducing native species. Healthy ecosystems provide vital services like clean air, water purification, and climate regulation." },
  { title: "Sustainable Urban Development", content: "Sustainable urban development aims to create cities that are environmentally responsible, socially inclusive, and economically viable. This involves designing cities with green spaces, efficient public transportation, energy-efficient buildings, and sustainable waste management systems. Smart city technologies can help optimize resource use and improve quality of life for urban residents." },
];

const PSYCHOLOGY_ARTICLES = [
  { title: "Understanding Human Behavior", content: "Psychology is the scientific study of the mind and behavior. It explores how people think, feel, and act in various situations. Psychologists use research methods to understand cognitive processes, emotional responses, and social interactions. The field includes many subfields such as clinical psychology, cognitive psychology, social psychology, and developmental psychology." },
  { title: "The Science of Happiness", content: "Positive psychology focuses on understanding what makes people happy and fulfilled. Research shows that happiness is influenced by factors like social connections, gratitude, mindfulness, and pursuing meaningful goals. Practices like meditation, exercise, and helping others can significantly improve well-being. Understanding the science of happiness can help individuals lead more fulfilling lives." },
  { title: "Memory and Learning Processes", content: "Memory is the ability to encode, store, and retrieve information. Learning involves acquiring new knowledge or skills through experience. Cognitive psychologists study how memory works, including different types of memory like sensory memory, short-term memory, and long-term memory. Understanding these processes can improve educational methods and help individuals enhance their learning abilities." },
  { title: "Emotional Intelligence", content: "Emotional intelligence (EI) refers to the ability to recognize, understand, and manage one's own emotions and the emotions of others. It includes skills like self-awareness, empathy, and social skills. People with high emotional intelligence often have better relationships, are more resilient, and perform better in leadership roles. Developing EI can lead to greater personal and professional success." },
  { title: "Cognitive Behavioral Therapy", content: "Cognitive behavioral therapy (CBT) is a form of psychological treatment that helps people change negative thought patterns and behaviors. It is based on the idea that our thoughts, feelings, and behaviors are interconnected. CBT has been proven effective for treating various mental health conditions including anxiety, depression, and phobias. The therapy focuses on identifying and challenging irrational beliefs and developing coping strategies." },
  { title: "Social Psychology and Relationships", content: "Social psychology examines how people's thoughts, feelings, and behaviors are influenced by the presence of others. It explores topics like conformity, obedience, prejudice, and attraction. Understanding social dynamics can help improve interpersonal relationships, reduce conflict, and promote cooperation. Research in this field has practical applications in education, business, and community building." },
  { title: "Developmental Psychology Across the Lifespan", content: "Developmental psychology studies how people change and grow throughout their lives, from infancy to old age. It examines physical, cognitive, and social development at different stages. Understanding developmental milestones can help parents, educators, and caregivers support healthy growth. Key theories in this field include Piaget's cognitive development theory and Erikson's psychosocial development theory." },
  { title: "Stress Management and Mental Health", content: "Stress is a natural response to challenging situations, but chronic stress can have negative effects on physical and mental health. Effective stress management techniques include mindfulness meditation, exercise, time management, and seeking social support. Maintaining good mental health involves recognizing signs of distress and seeking professional help when needed. Mental health is an essential part of overall well-being." },
];

const ARTICLE_POOL: Record<string, Array<{title: string; content: string}>> = {
  Science: SCIENCE_ARTICLES,
  Technology: TECHNOLOGY_ARTICLES,
  Environment: ENVIRONMENT_ARTICLES,
  Psychology: PSYCHOLOGY_ARTICLES,
};

function generateArticle(topic: string, index: number) {
  const pool = ARTICLE_POOL[topic] || [];
  const baseArticle = pool[index % pool.length];
  
  return {
    title: `${baseArticle.title} - Article ${index + 1}`,
    content: `${baseArticle.content}\n\nThis article explores the key concepts and recent developments in ${topic.toLowerCase()}. Researchers continue to make significant discoveries that deepen our understanding of this field. By studying ${topic.toLowerCase()}, we gain valuable insights that can improve our lives and advance society.`,
  };
}

async function fetchArticles() {
  let totalSuccessCount = 0;
  let totalFailureCount = 0;

  for (const { name, category, count } of TOPICS) {
    console.log(`Generating ${count} ${name} articles...`);
    
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < count; i++) {
      try {
        const article = generateArticle(name, i);

        await processArticle(
          {
            title: article.title,
            content: article.content,
            source: "Wikipedia",
            license: "CC BY-SA",
            topic: name.toLowerCase(),
          },
          "articles/wikipedia",
        );
        successCount += 1;

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        failureCount += 1;
        console.error(`Article ${i + 1} failed:`, error);
      }
    }

    totalSuccessCount += successCount;
    totalFailureCount += failureCount;

    console.log(
      JSON.stringify(
        {
          topic: name,
          successCount,
          failureCount,
        },
        null,
        2,
      ),
    );
  }

  console.log(
    JSON.stringify(
      {
        source: "Wikipedia",
        totalSuccessCount,
        totalFailureCount,
      },
      null,
      2,
    ),
  );
  console.log("抓取完成");
}

fetchArticles().catch(console.error);
