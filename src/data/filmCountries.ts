// Countries for films added before the app stored them (taken from OMDb, as "title|year").
// New films carry their own `country`. Most of the seed archive is American, as OMDb lists it.
const LEGACY_COUNTRIES: Record<string, string> = {
  "schindler's list|1994": 'United States',
  'memento|2001': 'United States',
  'drive my car|2021': 'Japan',
  'michael|2026': 'United States',
  'warrior|2011': 'United States',
  'ford v ferrari|2019': 'United States',
  'memories of murder|2003': 'South Korea',
  'the hunt|2012': 'Denmark, Sweden, Belgium, France',
  "one flew over the cuckoo's nest|1975": 'United States',
  'the pianist|2003': 'France, Germany, Poland, United Kingdom',
  'stand by me|1986': 'United States',
  'shutter island|2010': 'Canada, United States',
  'sunset boulevard|1950': 'United States',
  'the spine of night|2021': 'United States, United Kingdom',
  'no country for old men|2007': 'United States',
  'game night|2018': 'United States',
  'the last waltz|1978': 'United States',
  'scarface|1983': 'United States',
  'everything everywhere all at once|2022': 'United States',
  'rush|2013': 'United Kingdom, United States',
  'top gun: maverick|2022': 'United States',
  'project hail mary|2026': 'United States',
  'pandorum|2009': 'United Kingdom, Germany',
  'knives out|2019': 'United States',
};

export const countriesOf = (movie: { country?: string; title: string; originalTitle?: string; year: number }): string[] => {
  const raw = movie.country ?? LEGACY_COUNTRIES[`${(movie.originalTitle ?? movie.title).toLowerCase()}|${movie.year}`];
  return raw ? raw.split(',').map((c) => c.trim()).filter(Boolean) : [];
};

export interface NationalCinema {
  name: string;
  fact?: { tag: string; title: string; body: string };
}

// Keyed by OMDb's English name. Facts are well-documented milestones, not national stereotypes.
export const NATIONAL_CINEMA: Record<string, NationalCinema> = {
  'United States': { name: 'Mỹ', fact: { tag: 'Thập niên 1910', title: 'Vì sao lại là Hollywood', body: 'Từ thập niên 1910, các hãng phim dồn về miền Nam California, một phần vì nắng quanh năm rất hợp để quay ngoài trời.' } },
  'United Kingdom': { name: 'Anh', fact: { tag: '1927', title: 'Hitchcock trước khi sang Mỹ', body: 'Hitchcock làm phim ở Anh nhiều năm trước khi sang Hollywood. "The Lodger" (1927) thường được xem là phim đầu tiên mang rõ phong cách của ông.' } },
  France: { name: 'Pháp', fact: { tag: '1959', title: 'Làn sóng mới', body: '"Les Quatre Cents Coups" (1959) và "À bout de souffle" (1960) là hai cột mốc của Làn sóng mới Pháp, thời các nhà phê bình tự cầm máy làm phim.' } },
  Germany: { name: 'Đức', fact: { tag: '1920', title: 'Bối cảnh vẽ tay', body: '"Das Cabinet des Dr. Caligari" (1920) dùng bối cảnh vẽ méo mó, thành biểu tượng của chủ nghĩa biểu hiện Đức.' } },
  Italy: { name: 'Ý', fact: { tag: '1948', title: 'Tân hiện thực', body: '"Ladri di biciclette" (1948) quay ngoài đường phố với diễn viên không chuyên, một đỉnh cao của phong trào tân hiện thực Ý.' } },
  Japan: { name: 'Nhật Bản', fact: { tag: '1951', title: 'Sư tử vàng cho Rashomon', body: '"Rashomon" của Kurosawa giành Sư tử vàng tại Venice năm 1951, mở cánh cửa cho điện ảnh Nhật đến với khán giả phương Tây.' } },
  'South Korea': { name: 'Hàn Quốc', fact: { tag: '2020', title: 'Một đêm Oscar', body: '"Parasite" của Bong Joon-ho là phim không nói tiếng Anh đầu tiên đoạt Oscar Phim hay nhất, tại lễ trao giải năm 2020.' } },
  China: { name: 'Trung Quốc', fact: { tag: '1993', title: 'Cành cọ vàng', body: '"Bá Vương Biệt Cơ" của Trần Khải Ca đồng đoạt Cành cọ vàng năm 1993, phim tiếng Hoa đầu tiên có giải này.' } },
  'Hong Kong': { name: 'Hồng Kông', fact: { tag: '2000', title: 'Tâm trạng khi yêu', body: '"In the Mood for Love" của Vương Gia Vệ ra mắt ở Cannes năm 2000 và mang về giải Nam diễn viên cho Lương Triều Vỹ.' } },
  India: { name: 'Ấn Độ', fact: { tag: '1913', title: 'Phim truyện đầu tiên', body: '"Raja Harishchandra" (1913) của Dadasaheb Phalke thường được xem là phim truyện dài đầu tiên của Ấn Độ.' } },
  Iran: { name: 'Iran', fact: { tag: '1997', title: 'Vị của anh đào', body: '"Taste of Cherry" của Abbas Kiarostami đồng đoạt Cành cọ vàng năm 1997.' } },
  Vietnam: { name: 'Việt Nam', fact: { tag: '1993', title: 'Mùi đu đủ xanh', body: '"Mùi đu đủ xanh" của Trần Anh Hùng giành Camera d\'Or tại Cannes năm 1993 và được đề cử Oscar Phim ngoại ngữ hay nhất đại diện cho Việt Nam.' } },
  Denmark: { name: 'Đan Mạch', fact: { tag: '1995', title: 'Dogme 95', body: 'Lars von Trier và Thomas Vinterberg khởi xướng Dogme 95, bộ quy tắc làm phim khắt khe: quay tại chỗ, không nhạc nền thêm vào, máy cầm tay.' } },
  Sweden: { name: 'Thụy Điển', fact: { tag: '1957', title: 'Ván cờ với Thần Chết', body: 'Trong "Det sjunde inseglet" (1957) của Ingmar Bergman, một hiệp sĩ chơi cờ với Thần Chết, một trong những hình ảnh được nhắc lại nhiều nhất điện ảnh.' } },
  Poland: { name: 'Ba Lan', fact: { tag: 'Łódź', title: 'Trường phim Łódź', body: 'Trường điện ảnh ở Łódź đào tạo những tên tuổi như Andrzej Wajda, Roman Polanski và Krzysztof Kieślowski.' } },
  Belgium: { name: 'Bỉ', fact: { tag: '1999', title: 'Anh em Dardenne', body: 'Anh em Dardenne hai lần đoạt Cành cọ vàng, với "Rosetta" (1999) và "L\'Enfant" (2005).' } },
  Canada: { name: 'Canada', fact: { tag: '1952', title: 'Hoạt hình bằng người thật', body: '"Neighbours" (1952) của Norman McLaren, thuộc Ủy ban Điện ảnh Quốc gia Canada, đoạt Oscar với kỹ thuật pixilation: quay người thật từng khung hình.' } },
  Spain: { name: 'Tây Ban Nha', fact: { tag: '1999', title: 'Almodóvar', body: '"Todo sobre mi madre" (1999) của Pedro Almodóvar đoạt Oscar Phim ngoại ngữ hay nhất.' } },
  Mexico: { name: 'Mexico', fact: { tag: '2018', title: 'Roma', body: '"Roma" (2018) của Alfonso Cuarón giành Sư tử vàng tại Venice, quay đen trắng với diễn viên chính lần đầu đóng phim.' } },
  Thailand: { name: 'Thái Lan', fact: { tag: '2010', title: 'Cành cọ từ Đông Nam Á', body: '"Uncle Boonmee" của Apichatpong Weerasethakul đoạt Cành cọ vàng năm 2010, lần đầu với một phim Đông Nam Á.' } },
};

export const countryName = (country: string) => NATIONAL_CINEMA[country]?.name ?? country;
