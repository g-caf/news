// Mock data for development - replace with actual API calls
const mockPublications = [
  {
    id: 1,
    title: 'TechCrunch',
    logo: 'https://techcrunch.com/wp-content/uploads/2015/02/cropped-cropped-favicon-gradient.png',
    description: 'Technology news and startup coverage',
    website: 'https://techcrunch.com'
  },
  {
    id: 2,
    title: 'The Verge',
    logo: 'https://www.theverge.com/icons/icon-192x192.png',
    description: 'Technology, science, and culture',
    website: 'https://theverge.com'
  },
  {
    id: 3,
    title: 'Ars Technica',
    logo: 'https://cdn.arstechnica.net/wp-content/uploads/2016/10/cropped-ars-logo-512_480-32x32.png',
    description: 'Technology news and analysis',
    website: 'https://arstechnica.com'
  }
]

const mockArticles = [
  {
    id: 1,
    title: 'The Future of Artificial Intelligence: Trends and Predictions for 2024',
    description: 'Exploring the latest developments in AI technology and what they mean for the future of various industries.',
    content: `<p>Artificial Intelligence continues to evolve at an unprecedented pace, with 2024 marking a pivotal year for AI adoption across industries. From generative AI transforming creative workflows to machine learning revolutionizing healthcare diagnostics, the implications are far-reaching.</p>

<p>Key trends shaping the AI landscape include:</p>

<ul>
<li><strong>Multimodal AI Systems:</strong> Integration of text, image, audio, and video processing capabilities</li>
<li><strong>AI Safety and Alignment:</strong> Growing focus on responsible AI development</li>
<li><strong>Edge AI:</strong> Bringing AI processing closer to data sources</li>
<li><strong>AI-Human Collaboration:</strong> Tools that enhance rather than replace human capabilities</li>
</ul>

<p>The democratization of AI tools has enabled smaller companies to compete with tech giants, while regulatory frameworks are beginning to take shape globally. As we move forward, the emphasis shifts from raw computational power to practical applications that solve real-world problems.</p>`,
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
    url: 'https://example.com/ai-future',
    published_date: '2024-01-15T10:00:00Z',
    reading_time: 8,
    publication: mockPublications[0]
  },
  {
    id: 2,
    title: 'Revolutionary Breakthrough in Quantum Computing Achieved by Research Team',
    description: 'Scientists have achieved a major milestone in quantum computing that could accelerate practical applications.',
    content: `<p>A team of researchers has announced a significant breakthrough in quantum computing, demonstrating stable quantum states at room temperature for extended periods.</p>

<p>This achievement addresses one of the fundamental challenges in quantum computing: maintaining quantum coherence in practical conditions. The implications for cryptography, drug discovery, and complex optimization problems are substantial.</p>

<p>The research team utilized novel error correction techniques combined with innovative quantum gate designs to achieve these results. While practical quantum computers remain years away from mainstream adoption, this breakthrough represents a crucial step forward.</p>`,
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=400&fit=crop',
    url: 'https://example.com/quantum-breakthrough',
    published_date: '2024-01-14T14:30:00Z',
    reading_time: 6,
    publication: mockPublications[1]
  },
  {
    id: 3,
    title: 'Sustainable Technology: Green Innovations Leading the Climate Fight',
    description: 'How emerging technologies are being developed to address climate change and promote sustainability.',
    content: `<p>The intersection of technology and environmental sustainability has never been more critical. From carbon capture systems to renewable energy optimization, innovative solutions are emerging to combat climate change.</p>

<p>Key areas of development include:</p>

<ul>
<li>Advanced battery technologies for energy storage</li>
<li>Smart grid systems for efficient energy distribution</li>
<li>AI-powered climate modeling and prediction</li>
<li>Sustainable manufacturing processes</li>
</ul>

<p>These technologies represent hope for achieving global climate goals while maintaining economic growth.</p>`,
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=400&fit=crop',
    url: 'https://example.com/sustainable-tech',
    published_date: '2024-01-13T09:15:00Z',
    reading_time: 5,
    publication: mockPublications[2]
  },
  {
    id: 4,
    title: 'The Rise of No-Code Platforms: Democratizing Software Development',
    description: 'How no-code and low-code platforms are changing who can build software applications.',
    content: `<p>No-code platforms are revolutionizing software development by enabling non-programmers to create sophisticated applications through visual interfaces and drag-and-drop functionality.</p>

<p>This democratization of software development is having profound effects on business operations, allowing domain experts to directly translate their knowledge into functional applications without relying on technical intermediaries.</p>`,
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop',
    url: 'https://example.com/no-code-platforms',
    published_date: '2024-01-12T16:45:00Z',
    reading_time: 7,
    publication: mockPublications[0]
  },
  {
    id: 5,
    title: 'Cybersecurity in the Age of Remote Work: New Challenges and Solutions',
    description: 'Exploring the evolving cybersecurity landscape as remote work becomes the norm.',
    content: `<p>The shift to remote work has fundamentally changed the cybersecurity landscape, creating new vulnerabilities while requiring innovative protection strategies.</p>

<p>Organizations are adopting zero-trust security models, enhanced endpoint protection, and comprehensive employee training programs to address these challenges.</p>`,
    image: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&h=400&fit=crop',
    url: 'https://example.com/cybersecurity-remote-work',
    published_date: '2024-01-11T11:20:00Z',
    reading_time: 9,
    publication: mockPublications[1]
  }
]

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const api = {
  async getArticles({ limit = 20, offset = 0, publicationId = null, search = '' } = {}) {
    await delay(500)
    
    let filteredArticles = [...mockArticles]
    
    if (publicationId) {
      filteredArticles = filteredArticles.filter(article => 
        article.publication?.id === publicationId
      )
    }
    
    if (search) {
      const searchLower = search.toLowerCase()
      filteredArticles = filteredArticles.filter(article => 
        article.title.toLowerCase().includes(searchLower) ||
        article.description.toLowerCase().includes(searchLower)
      )
    }
    
    return filteredArticles.slice(offset, offset + limit)
  },

  async getArticle(id) {
    await delay(300)
    return mockArticles.find(article => article.id === parseInt(id))
  },

  async getPublications() {
    await delay(200)
    return mockPublications
  },

  async getPublication(id) {
    await delay(200)
    return mockPublications.find(pub => pub.id === parseInt(id))
  },

  async searchArticles(query) {
    return this.getArticles({ search: query, limit: 50 })
  }
}
