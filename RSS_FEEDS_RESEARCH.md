# RSS Feeds Research - 8 Publications

## Summary of Findings

| Publication | Status | Main Feed Available | Section Feeds | Full Text | Update Frequency | Auth Required |
|-------------|--------|-------------------|---------------|-----------|-----------------|---------------|
| New York Times | ✅ Working | Yes | Extensive | Excerpts | Frequent | No |
| Associated Press | ❌ No Public RSS | No | No | N/A | N/A | N/A |
| Reuters | ❌ Discontinued | No | No | N/A | N/A | N/A |
| Wired Magazine | ✅ Working | Yes | Good | Excerpts | Regular | No |
| The New Yorker | ✅ Working | Yes | Limited | Excerpts | Regular | No |
| New York Magazine | ✅ Working | Yes | Good | Excerpts | Regular | No |
| The Cut | ✅ Working | Yes | Limited | Excerpts | Regular | No |
| The Atlantic | ✅ Working | Yes | Good | Excerpts | Regular | No |

---

## Detailed Feed Information

### 1. New York Times ✅
**Status**: Fully functional with extensive feed options  
**Authentication**: None required  
**Feed Quality**: Headlines + brief excerpts  
**Update Frequency**: Very frequent (hourly)  

**Main Feed:**
- Homepage: `https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml` ✅ Tested

**Key Section Feeds:**
- World News: `https://rss.nytimes.com/services/xml/rss/nyt/World.xml`
- U.S. News: `https://rss.nytimes.com/services/xml/rss/nyt/US.xml`
- Politics: `https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml`
- Business: `https://rss.nytimes.com/services/xml/rss/nyt/Business.xml`
- Technology: `https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml`
- Health: `https://rss.nytimes.com/services/xml/rss/nyt/Health.xml`
- Science: `https://rss.nytimes.com/services/xml/rss/nyt/Science.xml`
- Arts: `https://rss.nytimes.com/services/xml/rss/nyt/Arts.xml`
- Opinion: `https://rss.nytimes.com/services/xml/rss/nyt/sunday-review.xml`

**Full Feed List**: https://www.nytimes.com/rss

---

### 2. Associated Press ❌
**Status**: No publicly available RSS feeds  
**Issue**: AP appears to have discontinued public RSS access. They use a custom XML format for clients and require authentication through their API platform.  
**Alternative**: Would need to use AP's commercial API or news aggregator services  
**Note**: Many users report inability to find working AP RSS feeds since ~2018

---

### 3. Reuters ❌
**Status**: RSS feeds discontinued  
**Issue**: Reuters discontinued their public RSS feeds around 2020-2021. Previous feed URLs (feeds.reuters.com) no longer work.  
**Alternative**: Would need commercial Reuters API access or news aggregator  
**Note**: Community discussions confirm feeds have been "dead" since mid-2020

---

### 4. Wired Magazine ✅
**Status**: Working RSS feeds available  
**Authentication**: None required  
**Feed Quality**: Headlines + excerpts  
**Update Frequency**: Regular (daily)

**Main Feed:**
- Top Stories: `https://www.wired.com/feed/rss` ✅ Tested

**Section Feeds:**
- Business: `https://www.wired.com/feed/category/business/latest/rss`
- AI/Tech: `https://www.wired.com/feed/tag/ai/latest/rss`
- Culture: `https://www.wired.com/feed/category/culture/latest/rss`
- Gear: `https://www.wired.com/feed/category/gear/latest/rss`
- Science: `https://www.wired.com/feed/category/science/latest/rss`
- Security: `https://www.wired.com/feed/category/security/latest/rss`
- Ideas: `https://www.wired.com/feed/category/ideas/latest/rss`

**Full List**: https://www.wired.com/about/rss-feeds/

---

### 5. The New Yorker ✅
**Status**: Working feeds with limited sections  
**Authentication**: None required  
**Feed Quality**: Headlines + brief excerpts  
**Update Frequency**: Regular (daily)

**Main Feeds:**
- Everything: `https://www.newyorker.com/feed/everything` ✅ Tested
- Web Posts: `https://www.newyorker.com/feed/posts`
- Magazine Articles: `https://www.newyorker.com/feed/magazine/rss`
- News: `https://www.newyorker.com/feed/news`

**Podcast Feeds:**
- Radio Hour: `http://feeds.wnyc.org/newyorkerradiohour`
- Writer's Voice: `http://feeds.wnyc.org/tnyauthorsvoice/`

**Full List**: https://www.newyorker.com/about/feeds

---

### 6. New York Magazine ✅
**Status**: Working feeds via FeedBurner  
**Authentication**: None required  
**Feed Quality**: Headlines + summaries, RSS 2.0 format  
**Update Frequency**: Regular updates

**Section Feeds:**
- Intelligencer (Politics): `http://feeds.feedburner.com/nymag/intelligencer` ✅ Tested
- Vulture (Entertainment): `http://feeds.feedburner.com/nymag/vulture`
- Grub Street (Food): `http://feeds.feedburner.com/nymag/grubstreet`
- The Strategist (Shopping): `https://feeds.feedburner.com/nymag/strategist`
- Curbed (Real Estate): `https://www.curbed.com/feeds/full-content.rss`

**Feed Info**: https://nymag.com/newyork/rss/

---

### 7. The Cut ✅
**Status**: Working as part of New York Magazine network  
**Authentication**: None required  
**Feed Quality**: Headlines + excerpts  
**Update Frequency**: Regular updates

**Main Feed:**
- The Cut: `http://feeds.feedburner.com/nymag/fashion` ✅ Tested

**Note**: The Cut is part of New York Magazine's network, so the feed URL uses "fashion" in the path

---

### 8. The Atlantic ✅
**Status**: Working feeds available  
**Authentication**: None required  
**Feed Quality**: Headlines + excerpts  
**Update Frequency**: Regular (daily)

**Main Feed:**
- All Articles: `https://www.theatlantic.com/feed/all/` ✅ Tested

**Section Feeds:**
- Politics: `https://www.theatlantic.com/feed/channel/politics/`
- Ideas: `https://www.theatlantic.com/feed/channel/ideas/`

**Note**: The Atlantic has additional section feeds following the pattern:
`https://www.theatlantic.com/feed/channel/[SECTION]/`

---

## Implementation Recommendations

### Immediately Usable (6/8):
1. **New York Times** - Excellent feed coverage, very reliable
2. **Wired Magazine** - Good sectioned feeds, tech-focused
3. **The New Yorker** - Quality content, limited sections
4. **New York Magazine** - Good network of feeds via FeedBurner
5. **The Cut** - Fashion/culture focus
6. **The Atlantic** - Quality journalism, simpler feed structure

### Require Alternative Solutions (2/8):
1. **Associated Press** - Need commercial API or news aggregator
2. **Reuters** - Need commercial API or alternative source

### Feed Quality Notes:
- All working feeds provide **excerpts only**, not full article text
- Updates range from **hourly** (NYT) to **daily** (others)
- No authentication barriers for any working feeds
- Most use standard RSS 2.0 format

### Technical Considerations:
- NYT uses their own domain (`rss.nytimes.com`)
- New York Magazine uses FeedBurner (`feeds.feedburner.com`)
- Others use their main domain with `/feed/` paths
- All tested feeds return valid XML with recent articles

### For Backend Implementation:
- Focus on the 6 working publications initially
- Consider RSS-to-JSON services for easier parsing
- Implement fallback handling for intermittent feed issues
- Monitor feed reliability over time
- Consider paid news APIs for AP/Reuters content if needed
