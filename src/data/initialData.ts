import type { Movie, WeekendSession } from '../types/cinema.ts';

export const INITIAL_MOVIES: Movie[] = [
  {
    "id": "gg-mv-watched-01",
    "rank": 1,
    "title": "Bản Danh Sách Của Schindler (Schindler's List)",
    "originalTitle": "Schindler's List",
    "year": 1994,
    "durationMinutes": 195,
    "genres": [
      "Tiểu sử",
      "Lịch sử",
      "Kịch tính"
    ],
    "director": "Steven Spielberg",
    "actors": "Liam Neeson, Ralph Fiennes, Ben Kingsley",
    "suggestedBy": "Lil Teng",
    "vibe": "Căng não",
    "platform": "Khác",
    "posterUrl": "https://m.media-amazon.com/images/M/MV5BNjM1ZDQxYWUtMzQyZS00MTE1LWJmZGYtNGUyNTdlYjM3ZmVmXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg",
    "trailerUrl": "https://www.youtube.com/results?search_query=Schindlers+List+1993+trailer",
    "synopsis": "In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.",
    "whyWatch": "👑 PHIM QUÁN QUÂN BẢNG XẾP HẠNG GAY GANG (8.92★). Tác phẩm vĩ đại nhất của Steven Spielberg về lòng nhân đạo trong thời kỳ diệt chủng.",
    "votes": [
      "Lil Teng",
      "Lộc",
      "Thành"
    ],
    "watched": true,
    "watchedDate": "2026-09-20",
    "statusBadge": "🎟️ Vé Vàng VIP",
    "legacySeason": "legacy",
    "scoreTeng": 8.65,
    "scoreLoc": 9,
    "scoreThanh": 9.12,
    "scoreAvg": 8.92,
    "adminNote": "oke",
    "reviews": [
      {
        "id": "rev-teng-schindler",
        "author": "Lil Teng",
        "rating": 8.65,
        "badge": "Vé Vàng VIP",
        "comment": "Phim đen trắng nhưng từng khung hình như tranh khắc họa nỗi đau nhân loại. Cô bé mặc áo khoác đỏ là biểu tượng bất tử.",
        "createdAt": "2026-09-20T22:00:00.000Z"
      },
      {
        "id": "rev-loc-schindler",
        "author": "Lộc",
        "rating": 9,
        "badge": "Vé Vàng VIP",
        "comment": "Ralph Fiennes diễn Amon Goeth ác lạnh sống lưng. Đoạn kết Schindler khóc vì chiếc nhẫn vàng làm tao nghẹn ngào.",
        "createdAt": "2026-09-20T22:15:00.000Z"
      },
      {
        "id": "rev-thanh-schindler",
        "author": "Thành",
        "rating": 9.12,
        "badge": "Vé Vàng VIP",
        "comment": "Xứng đáng điểm cao nhất nhóm từ trước đến nay. Kiệt tác điện ảnh không tì vết.",
        "createdAt": "2026-09-20T22:30:00.000Z"
      }
    ],
    "createdAt": "2026-09-10T10:00:00.000Z"
  },
  {
    "id": "gg-mv-watched-02",
    "rank": 2,
    "title": "Kẻ Mất Trí Nhớ (Memento)",
    "originalTitle": "Memento",
    "year": 2001,
    "durationMinutes": 113,
    "genres": [
      "Tâm lý",
      "Bí ẩn",
      "Giật gân"
    ],
    "director": "Christopher Nolan",
    "actors": "Guy Pearce, Carrie-Anne Moss, Joe Pantoliano",
    "suggestedBy": "Lộc",
    "vibe": "Căng não",
    "platform": "Khác",
    "posterUrl": "https://m.media-amazon.com/images/M/MV5BMGQ3Y2Q4NjktN2E4Ny00Y2Q2LTliZDUtZTNiNjRhY2I0NGIyXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg",
    "trailerUrl": "https://www.youtube.com/results?search_query=Memento+2000+trailer",
    "synopsis": "A former insurance investigator who now suffers from anterograde amnesia uses notes and tattoos to hunt down his wife's murderer.",
    "whyWatch": "🥈 HẠNG #2 BXH GAY GANG (8.56★). Christopher Nolan dựng phim ngược dòng thời gian, xoắn não kinh điển!",
    "votes": [
      "Lộc",
      "Lil Teng",
      "Thành"
    ],
    "watched": true,
    "watchedDate": "2026-10-04",
    "statusBadge": "🎟️ Vé Vàng VIP",
    "scoreTeng": 8.5,
    "scoreLoc": 8.5,
    "scoreThanh": 8.67,
    "scoreAvg": 8.56,
    "reviews": [
      {
        "id": "rev-teng-memento",
        "author": "Lil Teng",
        "rating": 8.5,
        "badge": "Vé Vàng VIP",
        "comment": "Cấu trúc tua ngược thời gian quá thông minh, xem xong phải ngồi ghép lại các mốc thời gian.",
        "createdAt": "2026-10-04T22:00:00.000Z"
      },
      {
        "id": "rev-loc-memento",
        "author": "Lộc",
        "rating": 8.5,
        "badge": "Vé Vàng VIP",
        "comment": "Phim ruột của tao! Xem với anh em vừa uống bia vừa đoán ai là Teddy thật sự.",
        "createdAt": "2026-10-04T22:15:00.000Z"
      },
      {
        "id": "rev-thanh-memento",
        "author": "Thành",
        "rating": 8.67,
        "badge": "Vé Vàng VIP",
        "comment": "Guy Pearce đóng xuất sắc, kết thúc cũng là mở đầu, lừa cả khán giả lẫn nhân vật chính.",
        "createdAt": "2026-10-04T22:30:00.000Z"
      }
    ],
    "createdAt": "2026-09-25T10:00:00.000Z"
  },
  {
    "id": "gg-mv-watched-03",
    "rank": 3,
    "title": "Cầm Lái Nỗi Nhớ (Drive My Car)",
    "originalTitle": "Drive My Car",
    "year": 2021,
    "durationMinutes": 179,
    "genres": [
      "Tâm lý",
      "Kịch tính"
    ],
    "director": "Ryûsuke Hamaguchi",
    "actors": "Hidetoshi Nishijima, Tôko Miura, Reika Kirishima",
    "suggestedBy": "Lil Teng",
    "vibe": "Ấm áp hoài niệm",
    "platform": "Khác",
    "posterUrl": "https://m.media-amazon.com/images/M/MV5BOGE5ZWRhYjYtNzVkMS00ZGU3LTg2MTMtODYyMmJlMDMyZjU0XkEyXkFqcGc@._V1_QL75_UY562_CR9,0,380,562_.jpg",
    "trailerUrl": "https://www.youtube.com/results?search_query=Drive+My+Car+2021+trailer",
    "synopsis": "A renowned stage actor and director learns to cope with a big personal loss when he receives an offer to direct a production of Uncle Vanya in Hiroshima.",
    "whyWatch": "🥉 HẠNG #3 BXH GAY GANG (7.65★). Phim Nhật đoạt Oscar, chiếc xe Saab 900 màu đỏ lăn bánh chữa lành tâm hồn.",
    "votes": [
      "Lil Teng",
      "Lộc",
      "Thành"
    ],
    "watched": true,
    "watchedDate": "2026-10-18",
    "statusBadge": "🎟️ Vé Vàng VIP",
    "scoreTeng": 7.6,
    "scoreLoc": 8,
    "scoreThanh": 7.36,
    "scoreAvg": 7.65,
    "adminNote": "tinh duc va quai di",
    "reviews": [
      {
        "id": "rev-teng-drivemycar",
        "author": "Lil Teng",
        "rating": 7.6,
        "badge": "Vé Vàng VIP",
        "comment": "3 tiếng trôi qua rất êm đềm, những đoạn đối thoại trong xe sâu sắc.",
        "createdAt": "2026-10-18T22:00:00.000Z"
      },
      {
        "id": "rev-loc-drivemycar",
        "author": "Lộc",
        "rating": 8,
        "badge": "Vé Vàng VIP",
        "comment": "Tao chấm 8 điểm vì cảnh cô lái xe và ông đạo diễn tâm sự trong tuyết trắng Hiroshima quá xúc động.",
        "createdAt": "2026-10-18T22:15:00.000Z"
      },
      {
        "id": "rev-thanh-drivemycar",
        "author": "Thành",
        "rating": 7.36,
        "badge": "Vé Vàng VIP",
        "comment": "Hơi chậm với anh em thích tiết tấu nhanh, nhưng càng về sau càng ngấm.",
        "createdAt": "2026-10-18T22:30:00.000Z"
      }
    ],
    "createdAt": "2026-10-01T10:00:00.000Z"
  },
  {
    "id": "gg-mv-watched-04",
    "rank": 4,
    "title": "Huyền Thoại Michael (Michael)",
    "originalTitle": "Michael",
    "year": 2026,
    "durationMinutes": 127,
    "genres": [
      "Tiểu sử",
      "Âm nhạc",
      "Kịch tính"
    ],
    "director": "Antoine Fuqua",
    "actors": "Jaafar Jackson, Nia Long, Colman Domingo",
    "suggestedBy": "Shiba",
    "vibe": "Hành động đỉnh cao",
    "platform": "Khác",
    "posterUrl": "https://m.media-amazon.com/images/M/MV5BNzllNmRlN2EtMDQyOC00ODJjLTg4OWQtZDNmNGU3YzlkNjc1XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    "trailerUrl": "https://www.youtube.com/results?search_query=Michael+Jackson+biopic+2025+trailer",
    "synopsis": "The early life of musician Michael Jackson, from the discovery of his talent as the lead of the Jackson Five to the artist whose creative ambition fueled a pursuit to become the biggest entertainer in the world.",
    "whyWatch": "🎖️ HẠNG #4 BXH GAY GANG (6.97★). Cháu ruột Jaafar Jackson tái hiện bước nhảy Moonwalk huyền thoại.",
    "votes": [
      "Shiba",
      "Lộc",
      "Thành",
      "Lil Teng"
    ],
    "watched": true,
    "watchedDate": "2026-10-18",
    "statusBadge": "🎟️ Vé Vàng VIP",
    "scoreTeng": 6.9,
    "scoreLoc": 7,
    "scoreThanh": 7,
    "scoreAvg": 6.97,
    "adminNote": "bth",
    "reviews": [
      {
        "id": "rev-teng-michael",
        "author": "Lil Teng",
        "rating": 6.9,
        "badge": "Vé Vàng VIP",
        "comment": "Nhạc bắt tai, tái hiện sân khấu hay nhưng kịch bản còn an toàn.",
        "createdAt": "2026-10-18T22:45:00.000Z"
      },
      {
        "id": "rev-loc-michael",
        "author": "Lộc",
        "rating": 7,
        "badge": "Vé Vàng VIP",
        "comment": "Xem giải trí cùng bia thì tròn vai, cháu trai giống Michael kinh ngạc.",
        "createdAt": "2026-10-18T23:00:00.000Z"
      },
      {
        "id": "rev-thanh-michael",
        "author": "Thành",
        "rating": 7,
        "badge": "Vé Vàng VIP",
        "comment": "Phim xem ổn áp, đoạn nhảy Billie Jean cuốn hút.",
        "createdAt": "2026-10-18T23:15:00.000Z"
      }
    ],
    "createdAt": "2026-10-05T10:00:00.000Z"
  },
  {
    "id": "gg-mv-01",
    "title": "Warrior (Chiến Binh)",
    "originalTitle": "Warrior",
    "year": 2011,
    "durationMinutes": 140,
    "genres": [
      "Hành động",
      "Kịch tính",
      "Võ thuật"
    ],
    "director": "Gavin O'Connor",
    "suggestedBy": "Shiba",
    "vibe": "Hành động đỉnh cao",
    "platform": "Netflix",
    "posterUrl": "https://m.media-amazon.com/images/M/MV5BMTk4ODk5MTMyNV5BMl5BanBnXkFtZTcwMDMyNTg0Ng@@._V1_QL75_UX380_CR0,12,380,562_.jpg",
    "trailerUrl": "https://www.youtube.com/results?search_query=Warrior+2011+trailer",
    "synopsis": "The youngest son of an alcoholic former boxer returns home, where he's trained by his father for competition in a mixed martial arts tournament - a path that puts the fighter on a collision course with his estranged older brother.",
    "whyWatch": "Tom Hardy đấm nhau MMA đỉnh cao, tình cảm anh em gia đình xúc động rớt nước mắt. Kèo cuối tuần siêu đầm!",
    "votes": [
      "Shiba",
      "Lộc",
      "Thành"
    ],
    "watched": false,
    "createdAt": "2026-10-01T10:00:00.000Z"
  },
  {
    "id": "gg-mv-02",
    "title": "Ford v Ferrari (Cuộc Đua Lịch Sử)",
    "originalTitle": "Ford v Ferrari",
    "year": 2019,
    "durationMinutes": 152,
    "genres": [
      "Hành động",
      "Tiểu sử",
      "Kịch tính"
    ],
    "director": "James Mangold",
    "suggestedBy": "Shiba",
    "vibe": "Hành động đỉnh cao",
    "platform": "HBO Max",
    "posterUrl": "https://m.media-amazon.com/images/M/MV5BOTBjNTEyNjYtYjdkNi00YzE5LTljYzUtZjVlYmYwZmJmZWYxXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    "trailerUrl": "https://www.youtube.com/results?search_query=Ford+v+Ferrari+2019+trailer",
    "synopsis": "American car designer Carroll Shelby and driver Ken Miles battle corporate interference and the laws of physics to build a revolutionary race car for Ford in order to defeat Ferrari at the 24 Hours of Le Mans in 1966.",
    "whyWatch": "Tiếng gầm rú của động cơ V8 7.000 vòng/phút, Christian Bale và Matt Damon diễn ăn ý tuyệt đối.",
    "votes": [
      "Shiba",
      "Lil Teng",
      "Nem"
    ],
    "watched": false,
    "createdAt": "2026-10-02T10:00:00.000Z"
  },
  {
    "id": "gg-mv-03",
    "title": "Hồi Ức Kẻ Sát Nhân",
    "originalTitle": "Memories of Murder",
    "year": 2003,
    "durationMinutes": 131,
    "genres": [
      "Tội phạm",
      "Kịch tính",
      "Bí ẩn"
    ],
    "director": "Bong Joon Ho",
    "suggestedBy": "Lil Teng",
    "vibe": "Căng não",
    "platform": "Netflix",
    "posterUrl": "https://m.media-amazon.com/images/M/MV5BYmRjOWE5NmMtYTdkYS00ODFlLWJiMTMtYzE2NDZlZjlkZDQ0XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    "trailerUrl": "https://www.youtube.com/results?search_query=Memories+of+Murder+2003+trailer",
    "synopsis": "In a small Korean province in 1986, two detectives struggle with the case of multiple young women being found raped and murdered by an unknown culprit.",
    "whyWatch": "Đỉnh cao trinh thám hình sự Hàn Quốc của Bong Joon-ho, cú nhìn thẳng vào ống kính của Song Kang-ho cuối phim ám ảnh đến già.",
    "votes": [
      "Lil Teng",
      "Lộc",
      "Thành",
      "Hoèn"
    ],
    "watched": false,
    "createdAt": "2026-10-03T10:00:00.000Z"
  },
  {
    "id": "gg-mv-04",
    "title": "Cuộc Săn Lùng (The Hunt)",
    "originalTitle": "The Hunt",
    "year": 2012,
    "durationMinutes": 115,
    "genres": [
      "Tâm lý",
      "Kịch tính"
    ],
    "director": "Thomas Vinterberg",
    "suggestedBy": "Shiba",
    "vibe": "Căng não",
    "platform": "Netflix",
    "posterUrl": "https://m.media-amazon.com/images/M/MV5BMTg2NDg3ODg4NF5BMl5BanBnXkFtZTcwNzk3NTc3Nw@@._V1_QL75_UY562_CR7,0,380,562_.jpg",
    "trailerUrl": "https://www.youtube.com/results?search_query=The+Hunt+2012+trailer",
    "synopsis": "A teacher lives a lonely life, all the while struggling over his son's custody. His life slowly gets better as he finds love, but his new luck is about to be brutally shattered by an innocent lie from a young girl.",
    "whyWatch": "Mads Mikkelsen diễn đỉnh nóc kịch trần. Xem xong thấy sự đáng sợ của tin đồn và đám đông định kiến.",
    "votes": [
      "Shiba",
      "Nem",
      "Thành"
    ],
    "watched": false,
    "createdAt": "2026-10-04T10:00:00.000Z"
  },
  {
    "id": "gg-mv-05",
    "title": "Bay Trên Tổ Chim Cúc Cu",
    "originalTitle": "One Flew Over the Cuckoo's Nest",
    "year": 1975,
    "durationMinutes": 133,
    "genres": [
      "Tâm lý",
      "Kịch tính"
    ],
    "director": "Miloš Forman",
    "suggestedBy": "Lil Teng",
    "vibe": "Ấm áp hoài niệm",
    "platform": "HBO Max",
    "posterUrl": "https://m.media-amazon.com/images/M/MV5BYjBkMjgzMzYtNzRiMS00NDc3LWE4YTUtZjYxYjZhNjNhYzhhXkEyXkFqcGc@._V1_QL75_UX380_CR0,1,380,562_.jpg",
    "trailerUrl": "https://www.youtube.com/results?search_query=One+Flew+Over+the+Cuckoos+Nest+1975+trailer",
    "synopsis": "A rebellious convict is sent to a psychiatric hospital for evaluation in 1963 Oregon, and encourages his docile companions to take more control of their lives and defy the tyrannical head nurse.",
    "whyWatch": "Một trong ba phim trong lịch sử ẵm trọn 5 tượng vàng Oscar quan trọng nhất. Diễn xuất Jack Nicholson thần sầu.",
    "votes": [
      "Lil Teng",
      "Lộc",
      "Hoèn"
    ],
    "watched": false,
    "createdAt": "2026-10-05T10:00:00.000Z"
  },
  {
    "id": "gg-mv-06",
    "title": "Nghệ Sĩ Dương Cầm (The Pianist)",
    "originalTitle": "The Pianist",
    "year": 2003,
    "durationMinutes": 150,
    "genres": [
      "Tiểu sử",
      "Lịch sử",
      "Kịch tính"
    ],
    "director": "Roman Polanski",
    "suggestedBy": "Lil Teng",
    "vibe": "Căng não",
    "platform": "VieON",
    "posterUrl": "https://m.media-amazon.com/images/M/MV5BMjEwNmEwYjgtNTk3ZC00NjljLTg5ZDctZTY3ZGQwZjRkZmQxXkEyXkFqcGc@._V1_QL75_UY562_CR14,0,380,562_.jpg",
    "trailerUrl": "https://www.youtube.com/results?search_query=The+Pianist+2002+trailer",
    "synopsis": "During WWII, acclaimed Polish musician Wladyslaw faces various struggles as he loses contact with his family. As the situation worsens, he hides in the ruins of Warsaw in order to survive.",
    "whyWatch": "Adrien Brody đóng cảnh sống sót giữa tàn tích đổ nát lay động tận tâm can. Nhạc Chopin vang lên rùng mình.",
    "votes": [
      "Lil Teng",
      "Shiba",
      "Thành"
    ],
    "watched": false,
    "createdAt": "2026-10-06T10:00:00.000Z"
  },
  {
    "id": "gg-mv-07",
    "title": "Hãy Đứng Bên Tôi (Stand by Me)",
    "originalTitle": "Stand by Me",
    "year": 1986,
    "durationMinutes": 89,
    "genres": [
      "Phiêu lưu",
      "Kịch tính",
      "Tâm lý"
    ],
    "director": "Rob Reiner",
    "suggestedBy": "Lộc",
    "vibe": "Ấm áp hoài niệm",
    "platform": "Netflix",
    "posterUrl": "https://m.media-amazon.com/images/M/MV5BNGJkNTUwM2MtZWE2MS00YjNkLWE3MjktNWQwZDQxMDIyZWVmXkEyXkFqcGc@._V1_QL75_UX380_CR0,18,380,562_.jpg",
    "trailerUrl": "https://www.youtube.com/results?search_query=Stand+by+Me+1986+trailer",
    "synopsis": "A writer recounts a childhood journey with his three best friends along the railway track to find the body of a missing boy in 1959 Oregon.",
    "whyWatch": "Phim tình bạn thiếu thời đỉnh nhất mọi thời đại. Hội bạn thân xem phim này thì chỉ có ôm nhau tâm sự đến sáng.",
    "votes": [
      "Lộc",
      "Shiba",
      "Hoèn",
      "Nem"
    ],
    "watched": false,
    "createdAt": "2026-10-07T10:00:00.000Z"
  },
  {
    "id": "gg-mv-08",
    "title": "Đảo Kinh Hoàng (Shutter Island)",
    "originalTitle": "Shutter Island",
    "year": 2010,
    "durationMinutes": 138,
    "genres": [
      "Tâm lý",
      "Bí ẩn",
      "Giật gân"
    ],
    "director": "Martin Scorsese",
    "suggestedBy": "Lộc",
    "vibe": "Căng não",
    "platform": "Netflix",
    "posterUrl": "https://m.media-amazon.com/images/M/MV5BN2FjNWExYzEtY2YzOC00YjNlLTllMTQtNmIwM2Q1YzBhOWM1XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    "trailerUrl": "https://www.youtube.com/results?search_query=Shutter+Island+2010+trailer",
    "synopsis": "Two US marshals are sent to a mental institution on an inhospitable island in order to investigate the disappearance of a patient, but uncover horrifying secrets.",
    "whyWatch": "Câu chốt: \"Sống như một con quái vật hay chết như một người tốt?\". Đoạn kết gây tranh cãi kinh điển của hội anh em.",
    "votes": [
      "Lộc",
      "Lil Teng",
      "Thành"
    ],
    "watched": false,
    "createdAt": "2026-10-08T10:00:00.000Z"
  },
  {
    "id": "gg-mv-09",
    "title": "Đại Lộ Hoàng Hôn (Sunset Boulevard)",
    "originalTitle": "Sunset Boulevard",
    "year": 1950,
    "durationMinutes": 110,
    "genres": [
      "Tâm lý",
      "Bí ẩn"
    ],
    "director": "Billy Wilder",
    "suggestedBy": "Hoèn",
    "vibe": "Căng não",
    "platform": "Khác",
    "posterUrl": "https://m.media-amazon.com/images/M/MV5BMTU0NTkyNzYwMF5BMl5BanBnXkFtZTgwMDU0NDk5MTI@._V1_QL75_UX380_CR0,5,380,562_.jpg",
    "trailerUrl": "https://www.youtube.com/results?search_query=Sunset+Boulevard+1950+trailer",
    "synopsis": "A screenwriter develops a dangerous relationship with a faded film star determined to make a triumphant return in Hollywood's golden age.",
    "whyWatch": "Bức tranh vạch trần góc tối Hollywood tàn nhẫn, mở đầu bằng xác chết nổi trên hồ bơi không thể nào quên.",
    "votes": [
      "Hoèn",
      "Lil Teng"
    ],
    "watched": false,
    "createdAt": "2026-10-09T10:00:00.000Z"
  },
  {
    "id": "gg-mv-10",
    "title": "The Spine of Night",
    "originalTitle": "The Spine of Night",
    "year": 2021,
    "durationMinutes": 93,
    "genres": [
      "Hoạt hình",
      "Giả tưởng",
      "Hành động"
    ],
    "director": "Philip Gelatt, Morgan Galen King",
    "suggestedBy": "Hoèn",
    "vibe": "Kinh dị thót tim",
    "platform": "Khác",
    "posterUrl": "https://m.media-amazon.com/images/M/MV5BM2VhYmU3MTEtYWI5Yi00NmQzLWFmMzAtZTM0OTk4NmRkNGQzXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    "trailerUrl": "https://www.youtube.com/results?search_query=The+Spine+of+Night+2021+trailer",
    "synopsis": "Ultra-violent, epic fantasy set in a land of magic follows heroes from different eras and cultures battling against a malevolent force.",
    "whyWatch": "Hoạt hình vẽ tay rotoscope phong cách thập niên 80, đẫm máu tà mị cuồng loạn.",
    "votes": [
      "Hoèn",
      "Nem"
    ],
    "watched": false,
    "createdAt": "2026-10-10T10:00:00.000Z"
  },
  {
    "id": "gg-mv-11",
    "title": "Không Chốn Dung Thân",
    "originalTitle": "No Country for Old Men",
    "year": 2007,
    "durationMinutes": 122,
    "genres": [
      "Tội phạm",
      "Kịch tính",
      "Giật gân"
    ],
    "director": "Ethan Coen, Joel Coen",
    "suggestedBy": "Nem",
    "vibe": "Căng não",
    "platform": "Netflix",
    "posterUrl": "https://m.media-amazon.com/images/M/MV5BMjA5Njk3MjM4OV5BMl5BanBnXkFtZTcwMTc5MTE1MQ@@._V1_QL75_UY562_CR1,0,380,562_.jpg",
    "trailerUrl": "https://www.youtube.com/results?search_query=No+Country+for+Old+Men+2007+trailer",
    "synopsis": "Violence and mayhem ensue after a hunter stumbles upon the aftermath of a drug deal gone wrong and over two million dollars in cash near the Rio Grande.",
    "whyWatch": "Gã sát thủ Anton Chigurh cầm bình khí nén tung đồng xu xem ai sống ai chết. Lạnh gáy từng giây!",
    "votes": [
      "Nem",
      "Shiba",
      "Lộc",
      "Thành"
    ],
    "watched": false,
    "createdAt": "2026-10-11T10:00:00.000Z"
  },
  {
    "id": "gg-mv-12",
    "title": "Đêm Chơi Nhớ Đời (Game Night)",
    "originalTitle": "Game Night",
    "year": 2018,
    "durationMinutes": 100,
    "genres": [
      "Hành động",
      "Hài hước",
      "Bí ẩn"
    ],
    "director": "John Francis Daley, Jonathan Goldstein",
    "suggestedBy": "Lộc",
    "vibe": "Hài bựa",
    "platform": "HBO Max",
    "posterUrl": "https://m.media-amazon.com/images/M/MV5BMjI3ODkzNDk5MF5BMl5BanBnXkFtZTgwNTEyNjY2NDM@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    "trailerUrl": "https://www.youtube.com/results?search_query=Game+Night+2018+trailer",
    "synopsis": "A group of friends who meet regularly for game nights find themselves entangled in a real-life mystery when the shady brother of one of them is seemingly kidnapped by dangerous gangsters.",
    "whyWatch": "Cực kỳ hợp cho hội anh em tụ tập uống bia, hài thông minh tình huống dở khóc dở cười liên tục.",
    "votes": [
      "Lộc",
      "Thành",
      "Shiba"
    ],
    "watched": false,
    "createdAt": "2026-10-12T10:00:00.000Z"
  },
  {
    "id": "gg-mv-13",
    "title": "Vũ Điệu Cuối Cùng (The Last Waltz)",
    "originalTitle": "The Last Waltz",
    "year": 1978,
    "durationMinutes": 117,
    "genres": [
      "Tài liệu",
      "Âm nhạc"
    ],
    "director": "Martin Scorsese",
    "suggestedBy": "Hệ thống",
    "vibe": "Ấm áp hoài niệm",
    "platform": "Khác",
    "posterUrl": "https://m.media-amazon.com/images/M/MV5BYWE3MjEzNjgtNzE2OC00ZTQwLWFhYjUtNDQ4ZWJhYTFmMzYzXkEyXkFqcGc@._V1_QL75_UX380_CR0,8,380,562_.jpg",
    "trailerUrl": "https://www.youtube.com/results?search_query=The+Last+Waltz+1978+trailer",
    "synopsis": "A film account and presentation of the final farewell concert of Canadian-American rock group The Band on Thanksgiving Day 1976.",
    "whyWatch": "Martin Scorsese làm đạo diễn âm nhạc rock n roll thì không thể chê vào đâu được, dàn huyền thoại biểu diễn đỉnh chóp.",
    "votes": [
      "Hệ thống",
      "Lil Teng"
    ],
    "watched": false,
    "createdAt": "2026-10-13T10:00:00.000Z"
  },
  {
    "id": "gg-mv-14",
    "title": "Mặt Sẹo (Scarface)",
    "originalTitle": "Scarface",
    "year": 1983,
    "durationMinutes": 170,
    "genres": [
      "Tội phạm",
      "Hành động",
      "Kịch tính"
    ],
    "director": "Brian De Palma",
    "suggestedBy": "Lil Teng",
    "vibe": "Hành động đỉnh cao",
    "platform": "Netflix",
    "posterUrl": "https://m.media-amazon.com/images/M/MV5BNDUzYjY0NmUtMDM4OS00Y2Q5LWJiODYtNTk0ZTk0YjZhMTg1XkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg",
    "trailerUrl": "https://www.youtube.com/results?search_query=Scarface+1983+trailer",
    "synopsis": "In the 1980s, a determined criminal-minded Cuban immigrant becomes the biggest drug smuggler in Miami, and is eventually undone by his own drug addiction.",
    "whyWatch": "\"Say hello to my little friend!\". Tony Montana là tượng đài bất hủ của phim xã hội đen thế giới.",
    "votes": [
      "Lil Teng",
      "Shiba",
      "Nem",
      "Thành"
    ],
    "watched": false,
    "createdAt": "2026-10-14T10:00:00.000Z"
  },
  {
    "id": "gg-mv-15",
    "title": "Cuộc Chiến Đa Vũ Trụ",
    "originalTitle": "Everything Everywhere All at Once",
    "year": 2022,
    "durationMinutes": 139,
    "genres": [
      "Hành động",
      "Phiêu lưu",
      "Hài hước"
    ],
    "director": "Daniel Kwan, Daniel Scheinert",
    "suggestedBy": "Shiba",
    "vibe": "Hài bựa",
    "platform": "VieON",
    "posterUrl": "https://m.media-amazon.com/images/M/MV5BOWNmMzAzZmQtNDQ1NC00Nzk5LTkyMmUtNGI2N2NkOWM4MzEyXkEyXkFqcGc@._V1_QL75_UY562_CR4,0,380,562_.jpg",
    "trailerUrl": "https://www.youtube.com/results?search_query=Everything+Everywhere+All+at+Once+trailer",
    "synopsis": "A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence by exploring other universes and connecting with the lives she could have led.",
    "whyWatch": "Thắng 7 giải Oscar. Ý tưởng quái đản hài hước nhưng đoạn hai tảng đá nói chuyện làm cả rạp xúc động nghẹn ngào.",
    "votes": [
      "Shiba",
      "Lộc",
      "Lil Teng"
    ],
    "watched": false,
    "createdAt": "2026-10-15T10:00:00.000Z"
  },
  {
    "id": "gg-mv-16",
    "title": "Đường Đua Nghẹt Thở (Rush)",
    "originalTitle": "Rush",
    "year": 2013,
    "durationMinutes": 123,
    "genres": [
      "Tiểu sử",
      "Hành động",
      "Kịch tính"
    ],
    "director": "Ron Howard",
    "suggestedBy": "Shiba",
    "vibe": "Hành động đỉnh cao",
    "platform": "Netflix",
    "posterUrl": "https://m.media-amazon.com/images/M/MV5BMTZhOGQxM2ItNGQyYy00YzE5LWI5MjMtNmMzNGQzNDE1OTUzXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    "trailerUrl": "https://www.youtube.com/results?search_query=Rush+2013+trailer",
    "synopsis": "James Hunt and Niki Lauda, two extremely skilled Formula One racers, have an intense rivalry with each other. However, it is their enmity that pushes them to their limits.",
    "whyWatch": "Cuộc đối đầu huyền thoại F1 mùa giải 1976. Xem cảnh Niki Lauda trở lại sau vụ tai nạn thiêu cháy mà nổi da gà.",
    "votes": [
      "Shiba",
      "Thành",
      "Nem"
    ],
    "watched": false,
    "createdAt": "2026-10-16T10:00:00.000Z"
  },
  {
    "id": "gg-mv-17",
    "title": "Phi Công Siêu Đẳng Maverick",
    "originalTitle": "Top Gun: Maverick",
    "year": 2022,
    "durationMinutes": 130,
    "genres": [
      "Hành động",
      "Kịch tính"
    ],
    "director": "Joseph Kosinski",
    "suggestedBy": "Shiba",
    "vibe": "Hành động đỉnh cao",
    "platform": "HBO Max",
    "posterUrl": "https://m.media-amazon.com/images/M/MV5BMDBkZDNjMWEtOTdmMi00NmExLTg5MmMtNTFlYTJlNWY5YTdmXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    "trailerUrl": "https://www.youtube.com/results?search_query=Top+Gun+Maverick+trailer",
    "synopsis": "The story involves Maverick confronting his past while training a group of younger Top Gun graduates, including the son of his deceased best friend, for an impossible mission.",
    "whyWatch": "Tom Cruise tự lái máy bay tiêm kích thật 100%. Xem trên màn chiếu lớn với âm thanh vòm thì sướng run người!",
    "votes": [
      "Shiba",
      "Lộc",
      "Thành",
      "Lil Teng"
    ],
    "watched": false,
    "createdAt": "2026-10-17T10:00:00.000Z"
  },
  {
    "id": "gg-mv-18",
    "title": "Project Hail Mary (Dự Án Cứu Tinh)",
    "originalTitle": "Project Hail Mary",
    "year": 2026,
    "durationMinutes": 156,
    "genres": [
      "Phiêu lưu",
      "Khoa học viễn tưởng"
    ],
    "director": "Phil Lord, Christopher Miller",
    "suggestedBy": "Lộc",
    "vibe": "Căng não",
    "platform": "Rạp",
    "posterUrl": "https://m.media-amazon.com/images/M/MV5BNTkwNzJiYTctNzI3NC00NjE1LTlhYjktY2Q5MTdmMWFmNzcxXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    "trailerUrl": "https://www.youtube.com/results?search_query=Project+Hail+Mary+movie",
    "synopsis": "A science teacher wakes up alone on a spaceship. As his memory returns, he uncovers a mission to stop a mysterious substance killing Earth's sun, and realizes an unexpected friendship may be the key.",
    "whyWatch": "Cùng tác giả của The Martian (Người Về Từ Sao Hỏa). Ryan Gosling đóng chính, tác phẩm mong chờ nhất 2026!",
    "votes": [
      "Lộc",
      "Lil Teng",
      "Hoèn"
    ],
    "watched": false,
    "createdAt": "2026-10-18T10:00:00.000Z"
  },
  {
    "id": "gg-mv-19",
    "title": "Pandorum (Hội Chứng Không Gian)",
    "originalTitle": "Pandorum",
    "year": 2009,
    "durationMinutes": 108,
    "genres": [
      "Hành động",
      "Kinh dị",
      "Khoa học viễn tưởng"
    ],
    "director": "Christian Alvart",
    "suggestedBy": "Lộc",
    "vibe": "Kinh dị thót tim",
    "platform": "Torrent/Stremio",
    "posterUrl": "https://m.media-amazon.com/images/M/MV5BNDQxNjc5NTMxNl5BMl5BanBnXkFtZTcwNjg2NDE4Mg@@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    "trailerUrl": "https://www.youtube.com/results?search_query=Pandorum+2009+trailer",
    "synopsis": "Two crew members of a spaceship wake up from hypersleep to discover that all their colleagues are missing, and they are hunted by horrifying mutant creatures.",
    "whyWatch": "Căng thẳng ngột ngạt trong khoang tàu không gian tối om, plot twist cuối cùng cực kỳ bất ngờ.",
    "votes": [
      "Lộc",
      "Nem"
    ],
    "watched": false,
    "createdAt": "2026-10-19T10:00:00.000Z"
  },
  {
    "id": "gg-mv-20-unwatched",
    "title": "Kẻ Đâm Lén (Knives Out)",
    "originalTitle": "Knives Out",
    "year": 2019,
    "durationMinutes": 130,
    "genres": [
      "Hài hước",
      "Bí ẩn",
      "Tội phạm"
    ],
    "director": "Rian Johnson",
    "suggestedBy": "Lil Teng",
    "vibe": "Hài bựa",
    "platform": "Netflix",
    "posterUrl": "https://m.media-amazon.com/images/M/MV5BZDU5ZTRkYmItZjg0Mi00ZTQwLThjMWItNWM3MTMxMzVjZmVjXkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    "trailerUrl": "https://www.youtube.com/results?search_query=Knives+Out+2019+trailer",
    "synopsis": "When renowned crime novelist Harlan Thrombey is found dead at his estate just after his 85th birthday, the inquisitive Detective Benoit Blanc is mysteriously enlisted to investigate.",
    "whyWatch": "Thước phim trinh thám hài hước đỉnh cao của Rian Johnson, cả hội Gay Gang đề cử!",
    "votes": [
      "Lil Teng",
      "Lộc",
      "Thành",
      "Shiba",
      "Hoèn",
      "Nem"
    ],
    "watched": false,
    "createdAt": "2026-09-20T10:00:00.000Z"
  }
];

export const INITIAL_SESSIONS: WeekendSession[] = [
  {
    "id": "session-gg-01",
    "title": "Suất Chiếu Premiere Gay Gang Cuối Tuần Này",
    "date": "2026-10-24",
    "time": "20:30",
    "selectedMovieId": "gg-mv-01",
    "location": "Rạp Chiếu Riêng Tư Gay Gang // Phòng Khách Nhà Lộc",
    "snackDuty": [
      {
        "person": "Shiba",
        "item": "1 Thùng Bia Heineken Bạc & Bỏng Ngô Phô Mai"
      },
      {
        "person": "Lil Teng",
        "item": "Khô Gà Lá Chanh & Mực Nướng Sa Tế"
      },
      {
        "person": "Lộc",
        "item": "Phòng Máy Chiếu 120-Inch & Hệ Thống Loa 5.1"
      }
    ],
    "attendees": [
      {
        "name": "Shiba",
        "status": "going",
        "note": "Chắc chắn có mặt đúng 20h20 chuẩn bị bia"
      },
      {
        "name": "Lil Teng",
        "status": "going",
        "note": "Đã sẵn sàng chiến phim Warrior"
      },
      {
        "name": "Lộc",
        "status": "going",
        "note": "Chủ nhà đón tiếp anh em chu đáo"
      },
      {
        "name": "Thành",
        "status": "going",
        "note": "Mang thêm đồ ăn vặt"
      },
      {
        "name": "Hoèn",
        "status": "maybe",
        "note": "Tan làm lúc 20h sẽ phi qua"
      },
      {
        "name": "Nem",
        "status": "going",
        "note": "Có mặt đầy đủ"
      }
    ],
    "status": "upcoming"
  }
];
