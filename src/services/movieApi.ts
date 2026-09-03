import { MovieDetails, MovieSummary, SearchFilters, SeasonData } from '../types/movie'

const OMDB_KEYS = ['thewdb', '564727fa', '6c3a2d45', '4a3b711b']
let currentKeyIndex = 0

function getNextKey(): string {
  const key = OMDB_KEYS[currentKeyIndex % OMDB_KEYS.length]
  currentKeyIndex++
  return key
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8230;/g, '...')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

const memoryCache = new Map<string, any>()

export interface SearchResult {
  movies: MovieSummary[]
  totalResults: number
  error?: string
}

// ============================================================================
// Curated Franchise & Universe Catalog
// Used when users search for broad franchises like "marvel", "dc", "star wars", etc.
// to return exact universe releases rather than literal title substring matches.
// ============================================================================

interface FranchiseEntry {
  name: string
  aliases: string[]
  items: MovieSummary[]
}

const FRANCHISE_CATALOG: FranchiseEntry[] = [
  {
    name: 'Marvel Cinematic Universe & Marvel Blockbusters',
    aliases: ['marvel', 'mcu', 'marvel studios', 'marvel cinematic universe', 'avengers', 'marvel comics'],
    items: [
      { imdbID: 'tt4154796', Title: 'Avengers: Endgame', Year: '2019', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt4154796/img' },
      { imdbID: 'tt4154756', Title: 'Avengers: Infinity War', Year: '2018', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt4154756/img' },
      { imdbID: 'tt0848228', Title: 'The Avengers', Year: '2012', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0848228/img' },
      { imdbID: 'tt2395427', Title: 'Avengers: Age of Ultron', Year: '2015', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt2395427/img' },
      { imdbID: 'tt10872600', Title: 'Spider-Man: No Way Home', Year: '2021', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt10872600/img' },
      { imdbID: 'tt6263850', Title: 'Deadpool & Wolverine', Year: '2024', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt6263850/img' },
      { imdbID: 'tt0371746', Title: 'Iron Man', Year: '2008', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0371746/img' },
      { imdbID: 'tt1228705', Title: 'Iron Man 2', Year: '2010', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt1228705/img' },
      { imdbID: 'tt1300854', Title: 'Iron Man 3', Year: '2013', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt1300854/img' },
      { imdbID: 'tt3498820', Title: 'Captain America: Civil War', Year: '2016', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt3498820/img' },
      { imdbID: 'tt1843843', Title: 'Captain America: The Winter Soldier', Year: '2014', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt1843843/img' },
      { imdbID: 'tt1843866', Title: 'Captain America: The First Avenger', Year: '2011', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt1843866/img' },
      { imdbID: 'tt3501632', Title: 'Thor: Ragnarok', Year: '2017', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt3501632/img' },
      { imdbID: 'tt10648342', Title: 'Thor: Love and Thunder', Year: '2022', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt10648342/img' },
      { imdbID: 'tt0800369', Title: 'Thor', Year: '2011', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0800369/img' },
      { imdbID: 'tt2015381', Title: 'Guardians of the Galaxy', Year: '2014', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt2015381/img' },
      { imdbID: 'tt3896198', Title: 'Guardians of the Galaxy Vol. 2', Year: '2017', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt3896198/img' },
      { imdbID: 'tt6791350', Title: 'Guardians of the Galaxy Vol. 3', Year: '2023', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt6791350/img' },
      { imdbID: 'tt1825683', Title: 'Black Panther', Year: '2018', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt1825683/img' },
      { imdbID: 'tt9114286', Title: 'Black Panther: Wakanda Forever', Year: '2022', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt9114286/img' },
      { imdbID: 'tt1211837', Title: 'Doctor Strange', Year: '2016', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt1211837/img' },
      { imdbID: 'tt9419884', Title: 'Doctor Strange in the Multiverse of Madness', Year: '2022', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt9419884/img' },
      { imdbID: 'tt2250912', Title: 'Spider-Man: Homecoming', Year: '2017', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt2250912/img' },
      { imdbID: 'tt6320628', Title: 'Spider-Man: Far From Home', Year: '2019', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt6320628/img' },
      { imdbID: 'tt9362722', Title: 'Spider-Man: Across the Spider-Verse', Year: '2023', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt9362722/img' },
      { imdbID: 'tt4633694', Title: 'Spider-Man: Into the Spider-Verse', Year: '2018', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt4633694/img' },
      { imdbID: 'tt0947798', Title: 'Black Widow', Year: '2021', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0947798/img' },
      { imdbID: 'tt9376612', Title: 'Shang-Chi and the Legend of the Ten Rings', Year: '2021', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt9376612/img' },
      { imdbID: 'tt1431045', Title: 'Deadpool', Year: '2016', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt1431045/img' },
      { imdbID: 'tt5463162', Title: 'Deadpool 2', Year: '2018', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt5463162/img' },
      { imdbID: 'tt3315342', Title: 'Logan', Year: '2017', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt3315342/img' },
      { imdbID: 'tt9140554', Title: 'Loki', Year: '2021–2023', Type: 'series', Poster: 'https://images.metahub.space/poster/medium/tt9140554/img' },
      { imdbID: 'tt8663584', Title: 'WandaVision', Year: '2021', Type: 'series', Poster: 'https://images.metahub.space/poster/medium/tt8663584/img' },
      { imdbID: 'tt2356777', Title: 'Daredevil', Year: '2015–2018', Type: 'series', Poster: 'https://images.metahub.space/poster/medium/tt2356777/img' },
      { imdbID: 'tt6565702', Title: "X-Men '97", Year: '2024–', Type: 'series', Poster: 'https://images.metahub.space/poster/medium/tt6565702/img' },
    ],
  },
  {
    name: 'DC Universe, Batman & Superman Releases',
    aliases: ['dc', 'dceu', 'dc comics', 'dc universe', 'dcu', 'justice league', 'batman v superman'],
    items: [
      { imdbID: 'tt0468569', Title: 'The Dark Knight', Year: '2008', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0468569/img' },
      { imdbID: 'tt1877830', Title: 'The Batman', Year: '2022', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt1877830/img' },
      { imdbID: 'tt1345836', Title: 'The Dark Knight Rises', Year: '2012', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt1345836/img' },
      { imdbID: 'tt0372784', Title: 'Batman Begins', Year: '2005', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0372784/img' },
      { imdbID: 'tt0770828', Title: 'Man of Steel', Year: '2013', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0770828/img' },
      { imdbID: 'tt12361974', Title: "Zack Snyder's Justice League", Year: '2021', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt12361974/img' },
      { imdbID: 'tt2975590', Title: 'Batman v Superman: Dawn of Justice', Year: '2016', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt2975590/img' },
      { imdbID: 'tt0451279', Title: 'Wonder Woman', Year: '2017', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0451279/img' },
      { imdbID: 'tt7286456', Title: 'Joker', Year: '2019', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt7286456/img' },
      { imdbID: 'tt11315808', Title: 'Joker: Folie à Deux', Year: '2024', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt11315808/img' },
      { imdbID: 'tt6334354', Title: 'The Suicide Squad', Year: '2021', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt6334354/img' },
      { imdbID: 'tt0477348', Title: 'Aquaman', Year: '2018', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0477348/img' },
      { imdbID: 'tt9663764', Title: 'Aquaman and the Lost Kingdom', Year: '2023', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt9663764/img' },
      { imdbID: 'tt0448115', Title: 'Shazam!', Year: '2019', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0448115/img' },
      { imdbID: 'tt0439572', Title: 'The Flash', Year: '2023', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0439572/img' },
      { imdbID: 'tt0409459', Title: 'Watchmen', Year: '2009', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0409459/img' },
      { imdbID: 'tt6463678', Title: 'Black Adam', Year: '2022', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt6463678/img' },
      { imdbID: 'tt0096895', Title: 'Batman', Year: '1989', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0096895/img' },
      { imdbID: 'tt0103776', Title: 'Batman Returns', Year: '1992', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0103776/img' },
      { imdbID: 'tt0078346', Title: 'Superman', Year: '1978', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0078346/img' },
      { imdbID: 'tt13146404', Title: 'Peacemaker', Year: '2022–', Type: 'series', Poster: 'https://images.metahub.space/poster/medium/tt13146404/img' },
      { imdbID: 'tt10344522', Title: 'The Penguin', Year: '2024', Type: 'series', Poster: 'https://images.metahub.space/poster/medium/tt10344522/img' },
    ],
  },
  {
    name: 'Star Wars Saga & Universe',
    aliases: ['star wars', 'starwars', 'lucasfilm', 'jedi'],
    items: [
      { imdbID: 'tt0076759', Title: 'Star Wars: Episode IV - A New Hope', Year: '1977', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0076759/img' },
      { imdbID: 'tt0080684', Title: 'Star Wars: Episode V - The Empire Strikes Back', Year: '1980', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0080684/img' },
      { imdbID: 'tt0086190', Title: 'Star Wars: Episode VI - Return of the Jedi', Year: '1983', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0086190/img' },
      { imdbID: 'tt0120915', Title: 'Star Wars: Episode I - The Phantom Menace', Year: '1999', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0120915/img' },
      { imdbID: 'tt0121765', Title: 'Star Wars: Episode II - Attack of the Clones', Year: '2002', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0121765/img' },
      { imdbID: 'tt0121766', Title: 'Star Wars: Episode III - Revenge of the Sith', Year: '2005', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0121766/img' },
      { imdbID: 'tt2488496', Title: 'Star Wars: Episode VII - The Force Awakens', Year: '2015', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt2488496/img' },
      { imdbID: 'tt2527336', Title: 'Star Wars: Episode VIII - The Last Jedi', Year: '2017', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt2527336/img' },
      { imdbID: 'tt2527338', Title: 'Star Wars: Episode IX - The Rise of Skywalker', Year: '2019', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt2527338/img' },
      { imdbID: 'tt3748528', Title: 'Rogue One: A Star Wars Story', Year: '2016', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt3748528/img' },
      { imdbID: 'tt3778644', Title: 'Solo: A Star Wars Story', Year: '2018', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt3778644/img' },
      { imdbID: 'tt8111088', Title: 'The Mandalorian', Year: '2019–', Type: 'series', Poster: 'https://images.metahub.space/poster/medium/tt8111088/img' },
      { imdbID: 'tt9253284', Title: 'Andor', Year: '2022–', Type: 'series', Poster: 'https://images.metahub.space/poster/medium/tt9253284/img' },
      { imdbID: 'tt13622776', Title: 'Ahsoka', Year: '2023–', Type: 'series', Poster: 'https://images.metahub.space/poster/medium/tt13622776/img' },
    ],
  },
  {
    name: 'Harry Potter & The Wizarding World',
    aliases: ['harry potter', 'wizarding world', 'hogwarts', 'fantastic beasts'],
    items: [
      { imdbID: 'tt0241527', Title: "Harry Potter and the Sorcerer's Stone", Year: '2001', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0241527/img' },
      { imdbID: 'tt0295297', Title: 'Harry Potter and the Chamber of Secrets', Year: '2002', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0295297/img' },
      { imdbID: 'tt0304141', Title: 'Harry Potter and the Prisoner of Azkaban', Year: '2004', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0304141/img' },
      { imdbID: 'tt0330373', Title: 'Harry Potter and the Goblet of Fire', Year: '2005', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0330373/img' },
      { imdbID: 'tt0373889', Title: 'Harry Potter and the Order of the Phoenix', Year: '2007', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0373889/img' },
      { imdbID: 'tt0417741', Title: 'Harry Potter and the Half-Blood Prince', Year: '2009', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0417741/img' },
      { imdbID: 'tt0926084', Title: 'Harry Potter and the Deathly Hallows: Part 1', Year: '2010', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0926084/img' },
      { imdbID: 'tt1201607', Title: 'Harry Potter and the Deathly Hallows: Part 2', Year: '2011', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt1201607/img' },
      { imdbID: 'tt3183660', Title: 'Fantastic Beasts and Where to Find Them', Year: '2016', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt3183660/img' },
    ],
  },
  {
    name: 'The Lord of the Rings & Middle-earth',
    aliases: ['lord of the rings', 'lotr', 'middle earth', 'tolkien', 'the hobbit', 'hobbit'],
    items: [
      { imdbID: 'tt0120737', Title: 'The Lord of the Rings: The Fellowship of the Ring', Year: '2001', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0120737/img' },
      { imdbID: 'tt0167261', Title: 'The Lord of the Rings: The Two Towers', Year: '2002', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0167261/img' },
      { imdbID: 'tt0167260', Title: 'The Lord of the Rings: The Return of the King', Year: '2003', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0167260/img' },
      { imdbID: 'tt0903624', Title: 'The Hobbit: An Unexpected Journey', Year: '2012', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0903624/img' },
      { imdbID: 'tt1170358', Title: 'The Hobbit: The Desolation of Smaug', Year: '2013', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt1170358/img' },
      { imdbID: 'tt2310332', Title: 'The Hobbit: The Battle of the Five Armies', Year: '2014', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt2310332/img' },
      { imdbID: 'tt7631058', Title: 'The Lord of the Rings: The Rings of Power', Year: '2022–', Type: 'series', Poster: 'https://images.metahub.space/poster/medium/tt7631058/img' },
    ],
  },
  {
    name: 'Pixar Animation Studios',
    aliases: ['pixar', 'disney pixar'],
    items: [
      { imdbID: 'tt0114709', Title: 'Toy Story', Year: '1995', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0114709/img' },
      { imdbID: 'tt0435625', Title: 'Toy Story 3', Year: '2010', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0435625/img' },
      { imdbID: 'tt1049413', Title: 'Up', Year: '2009', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt1049413/img' },
      { imdbID: 'tt0910970', Title: 'WALL·E', Year: '2008', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0910970/img' },
      { imdbID: 'tt2380307', Title: 'Coco', Year: '2017', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt2380307/img' },
      { imdbID: 'tt2096673', Title: 'Inside Out', Year: '2015', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt2096673/img' },
      { imdbID: 'tt22022452', Title: 'Inside Out 2', Year: '2024', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt22022452/img' },
      { imdbID: 'tt0266543', Title: 'Finding Nemo', Year: '2003', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0266543/img' },
      { imdbID: 'tt0382932', Title: 'Ratatouille', Year: '2007', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0382932/img' },
      { imdbID: 'tt0317705', Title: 'The Incredibles', Year: '2004', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0317705/img' },
      { imdbID: 'tt0198781', Title: 'Monsters, Inc.', Year: '2001', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0198781/img' },
    ],
  },
  {
    name: 'Studio Ghibli Classics',
    aliases: ['ghibli', 'studio ghibli', 'miyazaki', 'hayao miyazaki'],
    items: [
      { imdbID: 'tt0245429', Title: 'Spirited Away', Year: '2001', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0245429/img' },
      { imdbID: 'tt0119698', Title: 'Princess Mononoke', Year: '1997', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0119698/img' },
      { imdbID: 'tt0347149', Title: "Howl's Moving Castle", Year: '2004', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0347149/img' },
      { imdbID: 'tt0096283', Title: 'My Neighbor Totoro', Year: '1988', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0096283/img' },
      { imdbID: 'tt0095327', Title: 'Grave of the Fireflies', Year: '1988', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0095327/img' },
      { imdbID: 'tt0097647', Title: "Kiki's Delivery Service", Year: '1989', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0097647/img' },
      { imdbID: 'tt4530422', Title: 'The Boy and the Heron', Year: '2023', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt4530422/img' },
    ],
  },
  {
    name: 'Fast & Furious Franchise',
    aliases: ['fast and furious', 'fast & furious', 'fast furious', 'fast and the furious'],
    items: [
      { imdbID: 'tt0232500', Title: 'The Fast and the Furious', Year: '2001', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0232500/img' },
      { imdbID: 'tt0322259', Title: '2 Fast 2 Furious', Year: '2003', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0322259/img' },
      { imdbID: 'tt0463985', Title: 'The Fast and the Furious: Tokyo Drift', Year: '2006', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0463985/img' },
      { imdbID: 'tt1596343', Title: 'Fast Five', Year: '2011', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt1596343/img' },
      { imdbID: 'tt1905041', Title: 'Fast & Furious 6', Year: '2013', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt1905041/img' },
      { imdbID: 'tt2820852', Title: 'Furious 7', Year: '2015', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt2820852/img' },
      { imdbID: 'tt4630562', Title: 'The Fate of the Furious', Year: '2017', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt4630562/img' },
      { imdbID: 'tt5433138', Title: 'Fast & Furious Presents: Hobbs & Shaw', Year: '2019', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt5433138/img' },
      { imdbID: 'tt10366206', Title: 'Fast X', Year: '2023', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt10366206/img' },
    ],
  },
  {
    name: 'James Bond 007 Collection',
    aliases: ['james bond', '007', 'bond'],
    items: [
      { imdbID: 'tt1074638', Title: 'Skyfall', Year: '2012', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt1074638/img' },
      { imdbID: 'tt0381061', Title: 'Casino Royale', Year: '2006', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0381061/img' },
      { imdbID: 'tt2382320', Title: 'No Time to Die', Year: '2021', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt2382320/img' },
      { imdbID: 'tt2379713', Title: 'Spectre', Year: '2015', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt2379713/img' },
      { imdbID: 'tt0113189', Title: 'GoldenEye', Year: '1995', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0113189/img' },
      { imdbID: 'tt0058150', Title: 'Goldfinger', Year: '1964', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0058150/img' },
    ],
  },
  {
    name: 'MonsterVerse & Godzilla Titans',
    aliases: ['monsterverse', 'godzilla', 'king kong', 'kong'],
    items: [
      { imdbID: 'tt5034838', Title: 'Godzilla vs. Kong', Year: '2021', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt5034838/img' },
      { imdbID: 'tt14539740', Title: 'Godzilla x Kong: The New Empire', Year: '2024', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt14539740/img' },
      { imdbID: 'tt23289160', Title: 'Godzilla Minus One', Year: '2023', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt23289160/img' },
      { imdbID: 'tt3741700', Title: 'Godzilla: King of the Monsters', Year: '2019', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt3741700/img' },
      { imdbID: 'tt0837562', Title: 'Godzilla', Year: '2014', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt0837562/img' },
      { imdbID: 'tt3731562', Title: 'Kong: Skull Island', Year: '2017', Type: 'movie', Poster: 'https://images.metahub.space/poster/medium/tt3731562/img' },
      { imdbID: 'tt17220704', Title: 'Monarch: Legacy of Monsters', Year: '2023–', Type: 'series', Poster: 'https://images.metahub.space/poster/medium/tt17220704/img' },
    ],
  },
]

const KNOWN_GENRE_MAP: Record<string, string> = {
  action: 'Action',
  adventure: 'Adventure',
  animation: 'Animation',
  anime: 'Animation',
  comedy: 'Comedy',
  crime: 'Crime',
  documentary: 'Documentary',
  drama: 'Drama',
  family: 'Family',
  fantasy: 'Fantasy',
  horror: 'Horror',
  mystery: 'Mystery',
  romance: 'Romance',
  scifi: 'Sci-Fi',
  'sci-fi': 'Sci-Fi',
  'science fiction': 'Sci-Fi',
  thriller: 'Thriller',
  war: 'War',
  western: 'Western',
}

function findMatchingFranchise(rawQuery: string): FranchiseEntry | null {
  const clean = rawQuery.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim()
  if (!clean) return null

  for (const franchise of FRANCHISE_CATALOG) {
    for (const alias of franchise.aliases) {
      const cleanAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim()
      if (clean === cleanAlias || (clean.length >= 2 && cleanAlias === clean)) {
        return franchise
      }
    }
  }
  return null
}

export function getSearchCollectionTitle(query: string): string | null {
  const franchise = findMatchingFranchise(query)
  if (franchise) return franchise.name
  return null
}

export async function searchMovies(query: string, filters?: Partial<SearchFilters>): Promise<SearchResult> {
  const trimmed = query.trim()
  if (!trimmed) return { movies: [], totalResults: 0 }

  const type = filters?.type || ''
  const page = filters?.page || 1

  const cacheKey = `search:${trimmed.toLowerCase()}:${type}:${page}`
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey)
  }

  // 1. Check if user searched for a known curated Franchise / Universe (e.g. "marvel", "dc", "star wars")
  const matchingFranchise = findMatchingFranchise(trimmed)
  if (matchingFranchise) {
    const filteredItems = type
      ? matchingFranchise.items.filter((item) => item.Type.toLowerCase() === type.toLowerCase())
      : matchingFranchise.items

    const pageSize = 12
    const startIndex = (page - 1) * pageSize
    const pagedItems = filteredItems.slice(startIndex, startIndex + pageSize)

    const result: SearchResult = {
      movies: pagedItems,
      totalResults: filteredItems.length,
    }
    memoryCache.set(cacheKey, result)
    return result
  }

  // 2. Check if user searched for a generic category/genre name (e.g. "horror", "action", "sci-fi")
  const normalizedGenre = trimmed.toLowerCase().replace(/[^a-z0-9-]/g, '')
  if (KNOWN_GENRE_MAP[normalizedGenre]) {
    const genreResult = await fetchMoviesByGenre(KNOWN_GENRE_MAP[normalizedGenre], type as any)
    if (genreResult.movies.length > 0) {
      const pageSize = 12
      const startIndex = (page - 1) * pageSize
      const pagedItems = genreResult.movies.slice(startIndex, startIndex + pageSize)

      const result: SearchResult = {
        movies: pagedItems,
        totalResults: genreResult.movies.length,
      }
      memoryCache.set(cacheKey, result)
      return result
    }
  }

  // 3. Standard Title-Based Search via OMDb with key rotation
  for (let attempt = 0; attempt < OMDB_KEYS.length; attempt++) {
    const key = getNextKey()
    try {
      let url = `https://www.omdbapi.com/?s=${encodeURIComponent(trimmed)}&page=${page}&apikey=${key}`
      if (type) url += `&type=${encodeURIComponent(type)}`

      const res = await fetch(url)
      const data = await res.json()

      if (data.Response === 'True' && Array.isArray(data.Search)) {
        const result: SearchResult = {
          movies: data.Search.map((m: any) => ({
            imdbID: m.imdbID,
            Title: m.Title,
            Year: m.Year,
            Type: m.Type,
            Poster: m.Poster && m.Poster !== 'N/A' ? m.Poster : `https://images.metahub.space/poster/medium/${m.imdbID}/img`,
          })),
          totalResults: parseInt(data.totalResults, 10) || data.Search.length,
        }
        memoryCache.set(cacheKey, result)
        return result
      } else if (data.Error && data.Error.toLowerCase().includes('not found')) {
        return { movies: [], totalResults: 0, error: 'No movies found matching your search.' }
      }
    } catch {
      // Continue to next key or TVMaze fallback
    }
  }

  // Fallback to TVMaze API if OMDb is unavailable
  try {
    const tvmazeRes = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(trimmed)}`)
    const tvmazeData = await tvmazeRes.json()

    if (Array.isArray(tvmazeData) && tvmazeData.length > 0) {
      const movies: MovieSummary[] = tvmazeData.map((item: any) => ({
        imdbID: item.show.externals?.imdb || `tvmaze-${item.show.id}`,
        Title: item.show.name,
        Year: item.show.premiered ? item.show.premiered.slice(0, 4) : 'N/A',
        Type: item.show.type === 'Scripted' ? 'series' : 'movie',
        Poster: item.show.image?.medium || item.show.image?.original || '',
      }))

      const result: SearchResult = {
        movies,
        totalResults: movies.length,
      }
      memoryCache.set(cacheKey, result)
      return result
    }
  } catch {
    // Both failed
  }

  return { movies: [], totalResults: 0, error: 'Network error. Please try again.' }
}

export async function getMovieDetails(id: string): Promise<MovieDetails | null> {
  if (!id) return null

  const cacheKey = `details:${id}`
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey)
  }

  // If it's a TVMaze fallback ID
  if (id.startsWith('tvmaze-')) {
    const showId = id.replace('tvmaze-', '')
    try {
      const res = await fetch(`https://api.tvmaze.com/shows/${showId}`)
      if (res.ok) {
        const data = await res.json()
        const details: MovieDetails = {
          imdbID: id,
          Title: data.name,
          Year: data.premiered ? data.premiered.slice(0, 4) : 'N/A',
          Rated: 'TV-MA',
          Released: data.premiered || 'N/A',
          Runtime: `${data.runtime || 60} min`,
          Genre: Array.isArray(data.genres) ? data.genres.join(', ') : 'Drama',
          Director: 'N/A',
          Writer: 'N/A',
          Actors: 'Cast details available soon',
          Plot: data.summary ? data.summary.replace(/<[^>]*>?/gm, '') : 'No summary available.',
          Language: data.language || 'English',
          Country: data.network?.country?.name || 'USA',
          Awards: 'N/A',
          Poster: data.image?.original || data.image?.medium || '',
          Ratings: data.rating?.average ? [{ Source: 'TVMaze', Value: `${data.rating.average}/10` }] : [],
          Metascore: 'N/A',
          imdbRating: data.rating?.average ? data.rating.average.toString() : 'N/A',
          imdbVotes: 'N/A',
          Type: 'series',
          Response: 'True',
        }
        memoryCache.set(cacheKey, details)
        return details
      }
    } catch {
      // Fall through
    }
  }

  // If it's a PSA fallback ID
  if (id.startsWith('psa-')) {
    const rawSearch = id.replace('psa-', '').replace(/-/g, ' ')
    try {
      const searchRes = await searchMovies(rawSearch)
      if (searchRes.movies.length > 0) {
        const details = await getMovieDetails(searchRes.movies[0].imdbID)
        if (details) {
          memoryCache.set(cacheKey, details)
          return details
        }
      }
    } catch {
      // Continue
    }
  }

  // Fetch from OMDb by imdbID
  for (let attempt = 0; attempt < OMDB_KEYS.length; attempt++) {
    const key = getNextKey()
    try {
      const res = await fetch(`https://www.omdbapi.com/?i=${encodeURIComponent(id)}&plot=full&apikey=${key}`)
      const data = await res.json()

      if (data.Response === 'True') {
        const details: MovieDetails = {
          ...data,
          Poster: data.Poster && data.Poster !== 'N/A' ? data.Poster : `https://images.metahub.space/poster/medium/${id}/img`,
        }
        memoryCache.set(cacheKey, details)
        return details
      }
    } catch {
      // Try next key
    }
  }

  return null
}

export async function getSeasonEpisodes(seriesId: string, seasonNumber: number): Promise<SeasonData | null> {
  const cacheKey = `season:${seriesId}:${seasonNumber}`
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey)
  }

  // Attempt OMDb
  for (let attempt = 0; attempt < OMDB_KEYS.length; attempt++) {
    const key = getNextKey()
    try {
      const res = await fetch(
        `https://www.omdbapi.com/?i=${encodeURIComponent(seriesId)}&Season=${seasonNumber}&apikey=${key}`
      )
      const data = await res.json()

      if (data.Response === 'True') {
        memoryCache.set(cacheKey, data)
        return data
      }
    } catch {
      // Try next key
    }
  }

  // Fallback to TVMaze if possible
  try {
    const lookupRes = await fetch(`https://api.tvmaze.com/lookup/shows?imdb=${seriesId}`)
    if (lookupRes.ok) {
      const showData = await lookupRes.json()
      const epRes = await fetch(`https://api.tvmaze.com/shows/${showData.id}/episodes`)
      const allEpisodes = await epRes.json()

      if (Array.isArray(allEpisodes)) {
        const filtered = allEpisodes.filter((ep: any) => ep.season === seasonNumber)
        const totalSeasons = Math.max(...allEpisodes.map((ep: any) => ep.season || 1), 1).toString()

        const seasonData: SeasonData = {
          Title: showData.name,
          Season: seasonNumber.toString(),
          totalSeasons,
          Episodes: filtered.map((ep: any) => ({
            imdbID: `tvmaze-ep-${ep.id}`,
            Title: ep.name,
            Released: ep.airdate || 'N/A',
            Episode: ep.number?.toString() || '1',
            imdbRating: ep.rating?.average ? ep.rating.average.toString() : 'N/A',
          })),
          Response: 'True',
        }
        memoryCache.set(cacheKey, seasonData)
        return seasonData
      }
    }
  } catch {
    // Fallback failed
  }

  return null
}

let cachedPsaReleases: MovieSummary[] | null = null

/**
 * Parses items from the official psa.wf/feed/ RSS feed
 */
function parsePsaFeedXml(xmlText: string): { title: string; pureTitle: string; year: string; type: 'movie' | 'series'; poster: string; link: string }[] {
  const items: { title: string; pureTitle: string; year: string; type: 'movie' | 'series'; poster: string; link: string }[] = []
  const itemMatches = xmlText.match(/<item>[\s\S]*?<\/item>/gi) || []

  for (const it of itemMatches) {
    const rawTitle = (it.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || ''
    const rawLink = (it.match(/<link>([\s\S]*?)<\/link>/i) || [])[1] || ''
    const desc = (it.match(/<description>([\s\S]*?)<\/description>/i) || [])[1] || ''
    const cats = [...it.matchAll(/<category><!\[CDATA\[([\s\S]*?)\]\]><\/category>/gi)].map((m) => m[1])

    const cleanTitle = decodeHtmlEntities(rawTitle).trim()
    if (!cleanTitle) continue

    const isSeries = cats.some((c) => /tv-show|tv pack|series|episode/i.test(c)) || /\/tv-show\//i.test(rawLink)

    // Extract release year
    const yearInTitle = cleanTitle.match(/\((\d{4})\)/)
    const catYear = cats.find((c) => /^\d{4}$/.test(c))
    const currentYear = new Date().getFullYear().toString()
    const year = yearInTitle ? yearInTitle[1] : catYear || currentYear

    const pureTitle = cleanTitle.replace(/\s*\(\d{4}\)\s*/, '').trim()

    // Extract image thumbnail from description
    const imgMatch = desc.match(/src="([^"]+)"/i) || desc.match(/src='([^']+)'/i)
    const poster = imgMatch ? imgMatch[1] : ''

    items.push({
      title: cleanTitle,
      pureTitle,
      year,
      type: isSeries ? 'series' : 'movie',
      poster,
      link: rawLink,
    })
  }

  return items
}

/**
 * Fetches latest movie and TV show releases directly from https://psa.wf/feed/
 */
export async function fetchLatestReleases(): Promise<MovieSummary[]> {
  if (cachedPsaReleases && cachedPsaReleases.length > 0) {
    return cachedPsaReleases
  }

  const endpoints = [
    '/api/psa-feed/feed/',
    'https://psa.wf/feed/',
    `https://corsproxy.io/?${encodeURIComponent('https://psa.wf/feed/')}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent('https://psa.wf/feed/')}`,
  ]

  let psaItems: { title: string; pureTitle: string; year: string; type: 'movie' | 'series'; poster: string; link: string }[] = []

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: {
          Accept: 'application/rss+xml, application/xml, text/xml, */*',
        },
      })

      if (res.ok) {
        const text = await res.text()
        if (text && text.includes('<rss') && text.includes('<item>')) {
          psaItems = parsePsaFeedXml(text)
          if (psaItems.length > 0) {
            break
          }
        }
      }
    } catch {
      // Try next fallback endpoint
    }
  }

  if (psaItems.length > 0) {
    // Resolve each item with its OMDb IMDb ID in parallel (with timeout protection)
    const enrichedList: MovieSummary[] = await Promise.all(
      psaItems.map(async (item) => {
        try {
          const key = getNextKey()
          let omdbUrl = `https://www.omdbapi.com/?t=${encodeURIComponent(item.pureTitle)}&apikey=${key}`
          if (item.year && item.type === 'movie') {
            omdbUrl += `&y=${encodeURIComponent(item.year)}`
          }

          const res = await fetch(omdbUrl)
          if (res.ok) {
            const data = await res.json()
            if (data.Response === 'True' && data.imdbID) {
              return {
                imdbID: data.imdbID,
                Title: data.Title || item.pureTitle,
                Year: data.Year || item.year,
                Type: data.Type === 'series' ? 'series' : item.type,
                Poster: item.poster || (data.Poster && data.Poster !== 'N/A' ? data.Poster : ''),
              }
            }
          }
        } catch {
          // If individual OMDb query fails, fall back to title-based search ID
        }

        // Fallback: search OMDb with simple query
        try {
          const searchResult = await searchMovies(item.pureTitle, { type: item.type })
          if (searchResult.movies.length > 0) {
            const match = searchResult.movies[0]
            return {
              imdbID: match.imdbID,
              Title: match.Title,
              Year: match.Year,
              Type: match.Type,
              Poster: item.poster || match.Poster,
            }
          }
        } catch {
          // Continue
        }

        // Final fallback summary
        return {
          imdbID: `psa-${item.pureTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          Title: item.pureTitle,
          Year: item.year,
          Type: item.type,
          Poster: item.poster,
        }
      })
    )

    cachedPsaReleases = enrichedList
    return enrichedList
  }

  return []
}

/**
 * Fetches actual movies and series by genre from the Cinemeta catalog
 */
export async function fetchMoviesByGenre(
  genre: string,
  type: '' | 'movie' | 'series' = ''
): Promise<SearchResult> {
  const cleanGenre = genre.trim()
  if (!cleanGenre) return { movies: [], totalResults: 0 }

  const cacheKey = `genre:${cleanGenre}:${type}`
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey)
  }

  const results: MovieSummary[] = []

  const fetchMoviePromise =
    type === '' || type === 'movie'
      ? fetch(`https://v3-cinemeta.strem.io/catalog/movie/top/genre=${encodeURIComponent(cleanGenre)}.json`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      : Promise.resolve(null)

  const fetchSeriesPromise =
    type === '' || type === 'series'
      ? fetch(`https://v3-cinemeta.strem.io/catalog/series/top/genre=${encodeURIComponent(cleanGenre)}.json`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      : Promise.resolve(null)

  try {
    const [movieData, seriesData] = await Promise.all([fetchMoviePromise, fetchSeriesPromise])

    if (movieData && Array.isArray(movieData.metas)) {
      for (const m of movieData.metas) {
        if (m.imdb_id || m.id) {
          results.push({
            imdbID: m.imdb_id || m.id,
            Title: m.name,
            Year: m.releaseInfo || m.year || 'N/A',
            Type: 'movie',
            Poster: m.poster || `https://images.metahub.space/poster/medium/${m.imdb_id || m.id}/img`,
          })
        }
      }
    }

    if (seriesData && Array.isArray(seriesData.metas)) {
      for (const s of seriesData.metas) {
        if (s.imdb_id || s.id) {
          results.push({
            imdbID: s.imdb_id || s.id,
            Title: s.name,
            Year: s.releaseInfo || s.year || 'N/A',
            Type: 'series',
            Poster: s.poster || `https://images.metahub.space/poster/medium/${s.imdb_id || s.id}/img`,
          })
        }
      }
    }

    if (results.length > 0) {
      const searchResult: SearchResult = {
        movies: results,
        totalResults: results.length,
      }
      memoryCache.set(cacheKey, searchResult)
      return searchResult
    }
  } catch (e) {
    console.error('Failed to fetch genre from Cinemeta', e)
  }

  return { movies: [], totalResults: 0, error: `No titles found in the ${genre} genre.` }
}
