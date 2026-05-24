import os
import re
import json

IELTS_TOPICS = [
    {"title": "The History of Photography", "category": "科技", "difficulty": "7"},
    {"title": "Urbanization and Its Effects", "category": "社会", "difficulty": "7"},
    {"title": "Renewable Energy Sources", "category": "环境", "difficulty": "8"},
    {"title": "The Psychology of Consumer Behavior", "category": "商业", "difficulty": "7"},
    {"title": "Ancient Civilizations", "category": "历史", "difficulty": "8"},
    {"title": "Modern Medicine Advances", "category": "健康", "difficulty": "8"},
    {"title": "Artificial Intelligence in Education", "category": "教育", "difficulty": "9"},
    {"title": "Wildlife Conservation", "category": "自然", "difficulty": "7"},
    {"title": "Globalization Impact", "category": "社会", "difficulty": "8"},
    {"title": "Nanotechnology Applications", "category": "科技", "difficulty": "9"},
    {"title": "Bilingual Education Benefits", "category": "教育", "difficulty": "7"},
    {"title": "Climate Change Effects", "category": "环境", "difficulty": "8"},
    {"title": "The Evolution of Language", "category": "历史", "difficulty": "8"},
    {"title": "Digital Marketing Strategies", "category": "商业", "difficulty": "7"},
    {"title": "Space Exploration History", "category": "科技", "difficulty": "9"},
    {"title": "Mental Health Awareness", "category": "健康", "difficulty": "7"},
    {"title": "Traditional Crafts Preservation", "category": "艺术", "difficulty": "8"},
    {"title": "E-commerce Growth", "category": "商业", "difficulty": "7"},
    {"title": "Marine Biology Research", "category": "自然", "difficulty": "8"},
    {"title": "Educational Technology Trends", "category": "教育", "difficulty": "8"},
]

IELTS_PASSAGES = {
    "The History of Photography": """The invention of photography revolutionized how humans perceive and document the world. The earliest known photograph was taken in 1826 by Joseph Nicéphore Niépce using a process called heliography. This breakthrough paved the way for subsequent innovations in capturing light and creating permanent images.

In the 1830s, Louis Daguerre developed the daguerreotype, a method that produced highly detailed images on silver-plated copper sheets. This technology quickly spread across Europe and America, transforming portraiture and documentation. By the mid-19th century, photography had become accessible to the general public through the introduction of smaller, more portable cameras.

The 20th century brought significant advancements with the introduction of roll film by George Eastman in 1888, making photography truly accessible to the masses. Color photography, which had been experimented with since the 1860s, became commercially viable in the 1930s with the introduction of Kodachrome film.

Today, digital photography has largely replaced traditional film, offering instant results and unprecedented editing capabilities. The evolution from cumbersome equipment to pocket-sized smartphones has democratized image capture, ensuring that photography remains one of the most influential art forms of modern times.""",
    
    "Urbanization and Its Effects": """Urbanization is the process by which populations move from rural areas to cities, driven by economic opportunities and improved living standards. Over the past century, the global urban population has grown exponentially, with more than half of the world's people now residing in urban areas.

This migration brings both opportunities and challenges. Cities serve as hubs of innovation, commerce, and culture, attracting talent and fostering economic growth. However, rapid urbanization also leads to overcrowding, strain on infrastructure, and environmental degradation. Traffic congestion, air pollution, and housing shortages are common issues in densely populated urban centers.

Urban planners face the challenge of creating sustainable cities that balance growth with environmental responsibility. Initiatives such as green building design, public transportation systems, and urban green spaces aim to mitigate the negative impacts of urbanization while enhancing quality of life.

The future of urban living will depend on innovative solutions that address climate change, resource management, and social equity. Smart city technologies, renewable energy integration, and community-focused development are key strategies for creating livable urban environments.""",
    
    "Renewable Energy Sources": """Renewable energy has emerged as a critical solution to address climate change and reduce dependence on fossil fuels. Solar, wind, hydroelectric, and geothermal power are among the most promising renewable energy technologies, offering clean and sustainable alternatives to traditional energy sources.

Solar energy, harnessed through photovoltaic panels, has seen dramatic cost reductions in recent years, making it one of the most affordable forms of electricity generation. Wind power, particularly offshore wind farms, has also experienced significant growth, with modern turbines capable of generating substantial amounts of electricity.

Hydroelectric power, derived from flowing water, remains the largest source of renewable energy globally, providing reliable and consistent power. Geothermal energy, which utilizes heat from the Earth's interior, offers a stable and sustainable option for heating and electricity generation.

The transition to renewable energy requires significant investment in infrastructure and technology. However, the long-term benefits—including reduced carbon emissions, energy independence, and economic growth—make this transition essential for a sustainable future.""",
    
    "The Psychology of Consumer Behavior": """Understanding consumer behavior is essential for businesses seeking to create effective marketing strategies. Consumer psychology examines how individuals make purchasing decisions, influenced by factors such as motivation, perception, and social influence.

Motivation plays a crucial role in consumer behavior, with individuals driven by both intrinsic and extrinsic factors. Understanding these motivations helps businesses tailor their products and messaging to resonate with target audiences. Perception, the process by which individuals interpret sensory information, also significantly impacts purchasing decisions.

Social influence, including family, friends, and cultural norms, shapes consumer preferences and choices. Social media has emerged as a powerful influencer, with online reviews and recommendations playing an increasingly important role in consumer decision-making.

Consumer behavior research employs various methodologies, including surveys, focus groups, and observational studies. By analyzing consumer patterns and preferences, businesses can develop products and marketing campaigns that effectively meet customer needs and drive sales.""",
    
    "Ancient Civilizations": """Ancient civilizations laid the foundation for modern society, developing systems of governance, technology, and culture that continue to influence our world today. From the Mesopotamian city-states to the Roman Empire, these early societies made remarkable advancements in architecture, agriculture, and governance.

The Mesopotamians, located in present-day Iraq, developed one of the earliest writing systems, cuneiform, around 3500 BCE. This innovation enabled record-keeping, legal systems, and the preservation of knowledge. The Egyptians, known for their monumental architecture and sophisticated engineering, built the Great Pyramids as tombs for their pharaohs.

The Greeks made significant contributions to philosophy, mathematics, and democracy, with thinkers like Plato and Aristotle shaping Western intellectual tradition. The Roman Empire, with its vast network of roads, aqueducts, and legal systems, established a template for modern governance and infrastructure.

Studying ancient civilizations provides valuable insights into human ingenuity and the enduring challenges of organizing complex societies. These early cultures demonstrate humanity's capacity for innovation, adaptation, and cultural exchange.""",
    
    "Modern Medicine Advances": """Advancements in modern medicine have significantly improved human health and longevity over the past century. From the discovery of antibiotics to the development of gene therapy, medical science continues to push the boundaries of what is possible.

The discovery of penicillin by Alexander Fleming in 1928 revolutionized the treatment of bacterial infections, saving millions of lives. Vaccination programs have eradicated diseases such as smallpox and significantly reduced the prevalence of others like polio.

Recent breakthroughs in genomics and personalized medicine have opened new avenues for treating genetic disorders and cancer. Immunotherapy, which harnesses the body's immune system to fight disease, has shown promising results in treating various forms of cancer.

Medical technology has also advanced dramatically, with innovations such as minimally invasive surgery, robotic-assisted procedures, and advanced imaging techniques improving patient outcomes. The integration of artificial intelligence in diagnosis and treatment planning represents the next frontier in medical innovation.""",
    
    "Artificial Intelligence in Education": """Artificial intelligence is transforming education by providing personalized learning experiences, automating administrative tasks, and enhancing teaching methodologies. AI-powered tools can analyze student performance data to identify strengths and weaknesses, enabling tailored instruction.

Adaptive learning platforms use machine learning algorithms to adjust content difficulty and pace based on individual student progress. This personalized approach helps students learn more effectively by addressing their specific needs and learning styles.

AI chatbots and virtual assistants provide 24/7 support, answering student questions and guiding them through learning materials. These tools can also assist teachers by automating grading, generating lesson plans, and providing insights into student engagement.

While AI offers significant benefits, educators must also consider ethical implications, including data privacy, algorithmic bias, and the preservation of human interaction in learning. Balancing technological innovation with pedagogical best practices is essential for creating effective AI-enhanced educational environments.""",
    
    "Wildlife Conservation": """Wildlife conservation is critical for maintaining biodiversity and ecological balance. Human activities such as habitat destruction, poaching, and climate change pose significant threats to animal populations worldwide.

Conservation efforts focus on protecting endangered species, preserving natural habitats, and promoting sustainable practices. National parks, wildlife reserves, and protected areas provide safe havens for vulnerable species and ecosystems.

Anti-poaching initiatives, supported by technology such as drones and GPS tracking, help combat illegal wildlife trade. Community-based conservation programs engage local populations in protecting wildlife and their habitats, recognizing the interdependence between human communities and natural ecosystems.

International agreements such as the Convention on International Trade in Endangered Species (CITES) regulate the trade of endangered species and promote global cooperation in conservation efforts. Protecting wildlife is not only essential for ecological health but also for maintaining the cultural, economic, and aesthetic value of our natural world.""",
    
    "Globalization Impact": """Globalization has transformed the world economy, connecting nations through trade, technology, and cultural exchange. Advances in transportation and communication have made it easier than ever for goods, services, and ideas to cross international borders.

Economic globalization has led to increased trade, foreign investment, and the spread of multinational corporations. While this has brought economic growth and development to many regions, it has also created challenges such as income inequality and environmental degradation.

Cultural globalization has facilitated the exchange of ideas, traditions, and media across cultures. This cross-cultural interaction enriches societies but also raises concerns about cultural homogenization and the loss of traditional practices.

Political globalization has led to increased international cooperation through organizations such as the United Nations, promoting peace, human rights, and global governance. However, it also presents challenges related to national sovereignty and international conflicts.

Navigating the complexities of globalization requires balancing economic growth with social equity and environmental sustainability, ensuring that the benefits of globalization are shared equitably.""",
    
    "Nanotechnology Applications": """Nanotechnology, the manipulation of matter at the nanoscale, has opened new frontiers in science and technology. Applications range from medicine and electronics to energy and environmental remediation.

In medicine, nanoparticles are used for targeted drug delivery, enabling more effective treatment of diseases such as cancer. Nanoscale sensors can detect biomarkers for early disease diagnosis, improving patient outcomes.

In electronics, nanotechnology has enabled the development of smaller, faster, and more efficient devices. Nanomaterials such as graphene offer exceptional strength and conductivity, revolutionizing battery technology and semiconductor manufacturing.

Environmental applications include nanoscale filters for water purification and catalytic nanoparticles for pollution remediation. These technologies have the potential to address pressing environmental challenges.

While nanotechnology offers significant benefits, researchers also study potential risks, including the environmental impact of nanoparticles and their effects on human health. Responsible development and regulation are essential for maximizing the benefits of this transformative technology.""",
    
    "Bilingual Education Benefits": """Bilingual education provides significant cognitive, cultural, and social benefits for students. Research shows that bilingual individuals often demonstrate enhanced cognitive flexibility, problem-solving abilities, and creativity.

Learning a second language at an early age promotes brain development, particularly in areas related to language processing and executive function. Bilingual students often perform better on tasks requiring attention control and mental flexibility.

Culturally, bilingual education fosters understanding and appreciation of diverse perspectives, preparing students to thrive in an increasingly interconnected world. It also helps preserve cultural heritage and promotes social inclusion.

In terms of career opportunities, bilingual individuals have a competitive advantage in global job markets, with many employers seeking candidates with language proficiency. The ability to communicate in multiple languages opens doors to international careers and cross-cultural collaboration.

Implementing effective bilingual education programs requires trained educators, appropriate curriculum design, and support from educational institutions and communities.""",
    
    "Climate Change Effects": """Climate change poses one of the most significant challenges of our time, affecting ecosystems, weather patterns, and human societies worldwide. Rising global temperatures, melting ice caps, and extreme weather events are just some of the observable impacts.

The warming of the planet is primarily caused by human activities, particularly the burning of fossil fuels, which releases greenhouse gases into the atmosphere. These gases trap heat, leading to a gradual increase in global temperatures.

The consequences of climate change are far-reaching. Rising sea levels threaten coastal communities, while changes in precipitation patterns affect agricultural productivity and water availability. Extreme weather events, such as hurricanes, droughts, and wildfires, are becoming more frequent and intense.

Addressing climate change requires global cooperation to reduce greenhouse gas emissions, transition to renewable energy sources, and develop sustainable practices. Individual actions, such as reducing carbon footprints and supporting environmentally responsible policies, also play a crucial role in mitigating the effects of climate change.""",
    
    "The Evolution of Language": """Language is one of humanity's most remarkable achievements, enabling communication, culture, and knowledge transfer. The evolution of language from primitive vocalizations to complex linguistic systems reflects the development of human civilization.

Linguists believe that early human language emerged around 50,000 years ago, coinciding with significant cognitive and cultural advancements. These early languages were likely simple, consisting of basic sounds and gestures that allowed early humans to communicate essential information.

Over time, languages evolved and diversified, with different groups developing unique linguistic structures, vocabularies, and grammars. The invention of writing systems around 3500 BCE marked a significant milestone, enabling the preservation and transmission of knowledge across generations.

Today, there are approximately 7,000 languages spoken worldwide, each representing a unique cultural heritage. Language evolution continues as societies change, with new words being added and linguistic structures adapting to meet evolving communication needs.

Studying language evolution provides insights into human cognition, social organization, and cultural development, highlighting the profound role language plays in shaping human experience.""",
    
    "Digital Marketing Strategies": """Digital marketing has transformed how businesses connect with customers in the digital age. From social media advertising to search engine optimization, digital strategies offer unprecedented opportunities to reach target audiences.

Social media marketing allows businesses to engage with customers on platforms like Facebook, Instagram, and TikTok, building brand awareness and fostering customer loyalty. Content marketing, through blogs, videos, and infographics, provides value to customers while promoting products and services.

Search engine optimization (SEO) improves a website's visibility in search engine results, driving organic traffic and increasing brand exposure. Pay-per-click (PPC) advertising offers targeted reach, allowing businesses to display ads to users actively searching for related products or services.

Email marketing remains an effective tool for nurturing customer relationships, with personalized campaigns driving engagement and conversions. Analytics tools enable businesses to measure campaign effectiveness, optimize strategies, and make data-driven decisions.

Successful digital marketing requires a comprehensive approach that combines multiple channels and adapts to evolving consumer behaviors and technological advancements.""",
    
    "Space Exploration History": """Space exploration has captivated human imagination for centuries, pushing the boundaries of scientific knowledge and technological innovation. From the first satellites to manned missions to Mars, space exploration continues to inspire and challenge humanity.

The space age began in 1957 with the launch of Sputnik, the first artificial satellite, by the Soviet Union. This achievement sparked the space race between the United States and the Soviet Union, culminating in the Apollo 11 moon landing in 1969.

Since then, space exploration has expanded significantly, with robotic missions exploring planets, moons, and asteroids. The Hubble Space Telescope has provided breathtaking images of the universe, revolutionizing our understanding of cosmic phenomena.

International cooperation in space exploration has increased, with the International Space Station serving as a permanent research laboratory in orbit. Private companies like SpaceX are also playing an increasingly important role, developing reusable rockets and planning missions to Mars.

The future of space exploration holds exciting possibilities, including establishing lunar bases, sending humans to Mars, and searching for extraterrestrial life. These endeavors not only advance scientific knowledge but also inspire future generations to pursue careers in science and technology.""",
    
    "Mental Health Awareness": """Mental health awareness has grown significantly in recent years, reducing stigma and promoting understanding of mental health issues. Mental health, encompassing emotional, psychological, and social well-being, is essential for overall health and quality of life.

Common mental health conditions include anxiety disorders, depression, and bipolar disorder, affecting people of all ages and backgrounds. Factors contributing to mental health issues include genetics, environment, and life experiences.

Increasing awareness has led to improved access to mental health services, with more resources available for prevention, treatment, and support. Mental health education in schools and workplaces helps identify early signs of distress and promotes supportive environments.

Destigmatizing mental health encourages individuals to seek help without fear of judgment. Support networks, counseling services, and community organizations play crucial roles in providing assistance and promoting mental well-being.

Investing in mental health not only improves individual lives but also strengthens communities, demonstrating that mental health is an integral part of overall health and societal well-being.""",
    
    "Traditional Crafts Preservation": """Preserving traditional crafts is essential for maintaining cultural heritage and promoting sustainable livelihoods. Traditional crafts, passed down through generations, reflect the history, values, and creativity of communities.

From pottery and weaving to woodworking and metalwork, traditional crafts represent unique cultural expressions. These skills often require years of training and practice, embodying the wisdom and artistry of previous generations.

However, traditional crafts face challenges in the modern world, including declining interest among younger generations and competition from mass-produced goods. Industrialization and globalization have led to the decline of many traditional craft industries.

Efforts to preserve traditional crafts include establishing training programs, supporting artisan cooperatives, and promoting traditional crafts through markets and exhibitions. Governments and organizations also play a role in protecting intellectual property rights and providing financial support.

Preserving traditional crafts not only maintains cultural diversity but also supports sustainable development, providing income for artisans and keeping traditional skills alive for future generations.""",
    
    "E-commerce Growth": """E-commerce has transformed the retail landscape, offering consumers unprecedented convenience and choice. The growth of online shopping has been fueled by advancements in technology, logistics, and changing consumer preferences.

The rise of e-commerce giants like Amazon, Alibaba, and eBay has made online shopping accessible to millions worldwide. Consumers can now purchase products from anywhere at any time, with options for fast delivery and easy returns.

Small businesses also benefit from e-commerce, with platforms like Shopify and Etsy enabling entrepreneurs to reach global markets. Social commerce, integrating shopping with social media platforms, has further expanded e-commerce opportunities.

However, e-commerce also presents challenges, including cybersecurity risks, environmental concerns related to packaging and shipping, and the impact on traditional brick-and-mortar retailers.

As technology continues to evolve, e-commerce will likely continue to grow, with innovations such as augmented reality shopping experiences and drone delivery shaping the future of online retail.""",
    
    "Marine Biology Research": """Marine biology research is essential for understanding ocean ecosystems and addressing environmental challenges. The world's oceans cover over 70% of the Earth's surface, supporting incredible biodiversity and playing a crucial role in regulating the planet's climate.

Marine biologists study marine organisms, their habitats, and the complex interactions within ocean ecosystems. Research areas include marine biodiversity, coral reef conservation, and the impact of human activities on marine environments.

Advancements in technology, such as remotely operated vehicles (ROVs) and underwater drones, have expanded our ability to explore and study deep-sea environments. DNA sequencing and bioinformatics enable researchers to analyze marine biodiversity at unprecedented scales.

Marine biology research informs conservation efforts, helping protect endangered species and fragile ecosystems. Understanding marine ecosystems is also crucial for sustainable fisheries management and addressing climate change impacts such as ocean acidification and warming.

The oceans remain one of the least explored frontiers on Earth, offering vast opportunities for discovery and scientific advancement.""",
    
    "Educational Technology Trends": """Educational technology, or EdTech, is transforming teaching and learning through innovative tools and platforms. From online learning management systems to virtual reality experiences, EdTech is enhancing educational access and effectiveness.

Learning management systems (LMS) like Canvas and Moodle provide centralized platforms for course delivery, assignment management, and student collaboration. These systems enable educators to create interactive learning environments and track student progress.

Virtual and augmented reality technologies offer immersive learning experiences, allowing students to explore historical sites, simulate scientific experiments, and interact with virtual objects. Adaptive learning software uses artificial intelligence to personalize learning paths based on individual student needs.

Online learning platforms, such as Coursera and edX, provide access to courses from top universities worldwide, democratizing education and lifelong learning. Gamification, incorporating game elements into educational activities, increases student engagement and motivation.

As EdTech continues to evolve, educators must adapt to new technologies while maintaining focus on effective teaching practices and student well-being.""",
}

def generate_articles(articles_dir):
    os.makedirs(articles_dir, exist_ok=True)
    
    for topic in IELTS_TOPICS:
        title = topic["title"]
        content = IELTS_PASSAGES.get(title, "")
        
        if not content:
            continue
        
        slug = re.sub(r'[^a-zA-Z0-9]+', '-', title)[:50].lower().strip('-')
        slug = f"ielts-gen-{slug}"
        
        summary = content[:150].replace('\n', ' ').replace('"', "'")
        
        article_content = f"""---
title: "{title}"
category: "{topic['category']}"
difficulty: "{topic['difficulty']}"
summary: "{summary}..."
source: "雅思"
---

{content}
"""
        
        article_path = os.path.join(articles_dir, f"{slug}.md")
        
        if not os.path.exists(article_path):
            with open(article_path, 'w', encoding='utf-8') as f:
                f.write(article_content)
            print(f"Created article: {slug}.md")

def generate_quiz_data(quiz_data_dir):
    os.makedirs(quiz_data_dir, exist_ok=True)
    
    quiz_data = []
    
    for topic in IELTS_TOPICS:
        title = topic["title"]
        content = IELTS_PASSAGES.get(title, "")
        
        if not content:
            continue
        
        slug = re.sub(r'[^a-zA-Z0-9]+', '-', title)[:50].lower().strip('-')
        slug = f"ielts-gen-{slug}"
        
        questions = generate_questions(title, content)
        
        quiz_entry = {
            'quizKey': slug,
            'title': title,
            'passage': content,
            'questions': questions
        }
        
        quiz_data.append(quiz_entry)
    
    with open(os.path.join(quiz_data_dir, "ielts_generated_quiz_data.json"), 'w', encoding='utf-8') as f:
        json.dump(quiz_data, f, ensure_ascii=False, indent=2)
    
    print(f"\nGenerated {len(quiz_data)} quiz entries")

def generate_questions(title, content):
    questions = []
    
    if "photography" in title.lower():
        questions = [
            {"type": "true-false-not-given", "text": "The first photograph was taken in the 18th century.", "answer": "FALSE", "options": ["TRUE", "FALSE", "NOT GIVEN"]},
            {"type": "true-false-not-given", "text": "Louis Daguerre developed the daguerreotype process.", "answer": "TRUE", "options": ["TRUE", "FALSE", "NOT GIVEN"]},
            {"type": "true-false-not-given", "text": "Digital photography existed before color photography.", "answer": "FALSE", "options": ["TRUE", "FALSE", "NOT GIVEN"]},
            {"type": "multiple-choice", "text": "Who invented the daguerreotype?", "answer": "Louis Daguerre", "options": ["Joseph Nicéphore Niépce", "Louis Daguerre", "George Eastman", "Alexander Graham Bell"]},
            {"type": "multiple-choice", "text": "When was roll film introduced?", "answer": "1888", "options": ["1826", "1839", "1888", "1930"]}
        ]
    elif "urbanization" in title.lower():
        questions = [
            {"type": "true-false-not-given", "text": "More than half of the world's population lives in urban areas.", "answer": "TRUE", "options": ["TRUE", "FALSE", "NOT GIVEN"]},
            {"type": "true-false-not-given", "text": "Urbanization only brings positive effects.", "answer": "FALSE", "options": ["TRUE", "FALSE", "NOT GIVEN"]},
            {"type": "multiple-choice", "text": "What is a common challenge of rapid urbanization?", "answer": "Traffic congestion", "options": ["Increased biodiversity", "Traffic congestion", "Reduced pollution", "Lower living costs"]}
        ]
    elif "renewable" in title.lower():
        questions = [
            {"type": "true-false-not-given", "text": "Solar energy is one of the most affordable forms of electricity generation.", "answer": "TRUE", "options": ["TRUE", "FALSE", "NOT GIVEN"]},
            {"type": "multiple-choice", "text": "Which renewable energy source uses heat from the Earth's interior?", "answer": "Geothermal", "options": ["Solar", "Wind", "Geothermal", "Hydroelectric"]},
            {"type": "multiple-choice", "text": "Which is the largest source of renewable energy globally?", "answer": "Hydroelectric", "options": ["Solar", "Wind", "Hydroelectric", "Geothermal"]}
        ]
    elif "consumer" in title.lower():
        questions = [
            {"type": "true-false-not-given", "text": "Social media has no influence on consumer behavior.", "answer": "FALSE", "options": ["TRUE", "FALSE", "NOT GIVEN"]},
            {"type": "multiple-choice", "text": "What factors influence consumer behavior?", "answer": "All of the above", "options": ["Motivation", "Perception", "Social influence", "All of the above"]}
        ]
    elif "ancient" in title.lower():
        questions = [
            {"type": "true-false-not-given", "text": "The Mesopotamians developed cuneiform writing.", "answer": "TRUE", "options": ["TRUE", "FALSE", "NOT GIVEN"]},
            {"type": "multiple-choice", "text": "Which civilization built the Great Pyramids?", "answer": "Egyptian", "options": ["Greek", "Roman", "Egyptian", "Mesopotamian"]}
        ]
    elif "medicine" in title.lower():
        questions = [
            {"type": "true-false-not-given", "text": "Penicillin was discovered in the 20th century.", "answer": "TRUE", "options": ["TRUE", "FALSE", "NOT GIVEN"]},
            {"type": "multiple-choice", "text": "Who discovered penicillin?", "answer": "Alexander Fleming", "options": ["Marie Curie", "Alexander Fleming", "Louis Pasteur", "Isaac Newton"]}
        ]
    elif "artificial intelligence" in title.lower():
        questions = [
            {"type": "true-false-not-given", "text": "AI can analyze student performance data.", "answer": "TRUE", "options": ["TRUE", "FALSE", "NOT GIVEN"]},
            {"type": "multiple-choice", "text": "What is adaptive learning?", "answer": "Personalized learning based on progress", "options": ["One-size-fits-all education", "Personalized learning based on progress", "Teacher-led instruction only", "No technology use"]}
        ]
    elif "wildlife" in title.lower():
        questions = [
            {"type": "true-false-not-given", "text": "Poaching is a threat to wildlife.", "answer": "TRUE", "options": ["TRUE", "FALSE", "NOT GIVEN"]},
            {"type": "multiple-choice", "text": "What does CITES regulate?", "answer": "Trade of endangered species", "options": ["Air travel", "Trade of endangered species", "Education standards", "Climate policy"]}
        ]
    elif "globalization" in title.lower():
        questions = [
            {"type": "true-false-not-given", "text": "Globalization has only positive effects.", "answer": "FALSE", "options": ["TRUE", "FALSE", "NOT GIVEN"]},
            {"type": "multiple-choice", "text": "What is one benefit of globalization?", "answer": "Increased trade", "options": ["Reduced cultural exchange", "Increased trade", "Less international cooperation", "Decreased economic growth"]}
        ]
    elif "nanotechnology" in title.lower():
        questions = [
            {"type": "true-false-not-given", "text": "Nanotechnology involves manipulating matter at the atomic scale.", "answer": "TRUE", "options": ["TRUE", "FALSE", "NOT GIVEN"]},
            {"type": "multiple-choice", "text": "What is a potential application of nanotechnology?", "answer": "Targeted drug delivery", "options": ["Traditional farming", "Targeted drug delivery", "Paper manufacturing", "Horse transportation"]}
        ]
    elif "bilingual" in title.lower():
        questions = [
            {"type": "true-false-not-given", "text": "Bilingual individuals often have enhanced cognitive abilities.", "answer": "TRUE", "options": ["TRUE", "FALSE", "NOT GIVEN"]},
            {"type": "multiple-choice", "text": "What is a benefit of bilingual education?", "answer": "Enhanced problem-solving", "options": ["Reduced creativity", "Enhanced problem-solving", "Limited career opportunities", "Cultural isolation"]}
        ]
    elif "climate change" in title.lower():
        questions = [
            {"type": "true-false-not-given", "text": "Human activities contribute to climate change.", "answer": "TRUE", "options": ["TRUE", "FALSE", "NOT GIVEN"]},
            {"type": "multiple-choice", "text": "What is a consequence of climate change?", "answer": "Rising sea levels", "options": ["Decreased temperatures", "Rising sea levels", "More stable weather", "Increased biodiversity"]}
        ]
    elif "language" in title.lower():
        questions = [
            {"type": "true-false-not-given", "text": "Writing systems emerged around 3500 BCE.", "answer": "TRUE", "options": ["TRUE", "FALSE", "NOT GIVEN"]},
            {"type": "multiple-choice", "text": "Approximately how many languages are spoken worldwide?", "answer": "7,000", "options": ["100", "1,000", "7,000", "70,000"]}
        ]
    elif "digital marketing" in title.lower():
        questions = [
            {"type": "true-false-not-given", "text": "SEO stands for Search Engine Optimization.", "answer": "TRUE", "options": ["TRUE", "FALSE", "NOT GIVEN"]},
            {"type": "multiple-choice", "text": "What does PPC stand for in digital marketing?", "answer": "Pay-per-click", "options": ["Product price comparison", "Pay-per-click", "Personal product customization", "Professional product certification"]}
        ]
    elif "space" in title.lower():
        questions = [
            {"type": "true-false-not-given", "text": "Sputnik was the first artificial satellite.", "answer": "TRUE", "options": ["TRUE", "FALSE", "NOT GIVEN"]},
            {"type": "multiple-choice", "text": "When did the first moon landing occur?", "answer": "1969", "options": ["1957", "1961", "1969", "1980"]}
        ]
    elif "mental health" in title.lower():
        questions = [
            {"type": "true-false-not-given", "text": "Mental health awareness has decreased in recent years.", "answer": "FALSE", "options": ["TRUE", "FALSE", "NOT GIVEN"]},
            {"type": "multiple-choice", "text": "What is a common mental health condition?", "answer": "Depression", "options": ["Physical fitness", "Depression", "Nutrition", "Weather sensitivity"]}
        ]
    elif "crafts" in title.lower():
        questions = [
            {"type": "true-false-not-given", "text": "Traditional crafts face challenges from mass-produced goods.", "answer": "TRUE", "options": ["TRUE", "FALSE", "NOT GIVEN"]},
            {"type": "multiple-choice", "text": "Why is preserving traditional crafts important?", "answer": "Cultural heritage", "options": ["Modernization", "Cultural heritage", "Reduced costs", "Faster production"]}
        ]
    elif "e-commerce" in title.lower():
        questions = [
            {"type": "true-false-not-given", "text": "E-commerce has decreased consumer choice.", "answer": "FALSE", "options": ["TRUE", "FALSE", "NOT GIVEN"]},
            {"type": "multiple-choice", "text": "Which is a challenge of e-commerce?", "answer": "Cybersecurity risks", "options": ["Increased convenience", "Cybersecurity risks", "Lower prices", "Faster delivery"]}
        ]
    elif "marine" in title.lower():
        questions = [
            {"type": "true-false-not-given", "text": "Oceans cover less than 50% of Earth's surface.", "answer": "FALSE", "options": ["TRUE", "FALSE", "NOT GIVEN"]},
            {"type": "multiple-choice", "text": "What does ROV stand for in marine research?", "answer": "Remotely operated vehicle", "options": ["Rapid ocean vessel", "Remotely operated vehicle", "Regional ocean survey", "Research observation vessel"]}
        ]
    elif "educational technology" in title.lower():
        questions = [
            {"type": "true-false-not-given", "text": "EdTech stands for Educational Technology.", "answer": "TRUE", "options": ["TRUE", "FALSE", "NOT GIVEN"]},
            {"type": "multiple-choice", "text": "What is LMS in education?", "answer": "Learning management system", "options": ["Language monitoring service", "Learning management system", "Library maintenance service", "Long-term memory storage"]}
        ]
    
    return questions

def main():
    articles_dir = "articles"
    quiz_data_dir = "quiz_data"
    
    print("Generating IELTS articles...")
    generate_articles(articles_dir)
    
    print("\nGenerating quiz data...")
    generate_quiz_data(quiz_data_dir)
    
    print("\nDone! Generated 20 new IELTS reading articles with questions.")

if __name__ == "__main__":
    main()