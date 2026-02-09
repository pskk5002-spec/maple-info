
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const axios = require('axios');
const app = express();

require('dotenv').config(); // .env 파일의 환경 변수를 불러옴

const PORT = process.env.PORT;
const API_KEY = process.env.NEXON_API_KEY;
const NEXON_API_URL = 'https://open.api.nexon.com';

const nexonClient = axios.create({
    baseURL: NEXON_API_URL,
    headers: {
        'x-nxopen-api-key': API_KEY
    }
})

app.use(cors());
app.use(express.json()); // 리액트에서 보낸 JSON 데이터를 읽기 위해 필수!

// 1. MySQL 연결 설정
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'pskk5001', // 본인이 설정한 비밀번호
    database: 'my_maple_site'      // 본인이 만든 DB 이름
});

// 2. 파티 모집글 저장 API (POST)
app.post('/api/posts', (req, res) => {
    const { getType, boss, difficulty, skill, shortDescription, nickname, discord, memberCount } = req.body;

    const sql = `INSERT INTO posts 
        (getType, boss, difficulty, skill, shortDescription, nickname, discord,  memberCount) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [getType, boss, difficulty, skill, shortDescription, nickname, discord, memberCount], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("DB 저장 실패");
        }
        res.status(201).send({ message: "게시글 등록 성공", id: result.insertId });
    });
});

// 3. 파티 목록 불러오기 API (GET)
app.get('/api/posts', (req, res) => {
    const sql = "SELECT * FROM posts ORDER BY created_at DESC"; // 최신글 순으로
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// 게시글 삭제
app.delete('/api/posts/:id', (req, res) => {
    console.log('삭제 요청 id: ', req.params.id);
  const { id } = req.params;

  const sql = 'DELETE FROM posts WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('게시글 삭제 실패');
    }

    // 삭제할 글이 없는 경우
    if (result.affectedRows === 0) {
      return res.status(404).send('해당 게시글이 존재하지 않습니다');
    }

    res.send({ message: '게시글 삭제 성공' });
  });
});

  // 날짜 계산 로직
  const getQueryDate = () => {
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstDate = new Date(now.getTime() + kstOffset);
    const hour = kstDate.getUTCHours();
    const daysToSubtract = hour < 2 ? 2 : 1;
    const targetDate = new Date(kstDate.getTime() - (daysToSubtract * 24 * 60 * 60 * 1000));
    return targetDate.getUTCFullYear() + '-' + String(targetDate.getUTCMonth() + 1).padStart(2, '0') + '-' + String(targetDate.getUTCDate()).padStart(2, '0');
  };

const delay = (ms) =>
  new Promise(resolve => setTimeout(resolve, ms));


//단일 캐릭터
app.get('/api/character', async(req, res) => {
    try{
        const { characterName } = req.query;
        const date = getQueryDate();

        const idRes = await nexonClient.get(
            `/maplestory/v1/id?character_name=${encodeURIComponent(characterName)}`
        );
        const ocid = idRes.data.ocid;
        
        const [basicRes, statRes, itemRes, abilityRes] = await Promise.all([
            nexonClient.get(`/maplestory/v1/character/basic?ocid=${ocid}&date=${date}`),
            nexonClient.get(`/maplestory/v1/character/stat?ocid=${ocid}&date=${date}`),
            nexonClient.get(`/maplestory/v1/character/item-equipment?ocid=${ocid}&date=${date}`),
            nexonClient.get(`/maplestory/v1/character/ability?ocid=${ocid}&date=${date}`),
        ]);

        await delay(200);
        
        const resultData = {
            basic: basicRes.data,
            stats: statRes.data,
            items: itemRes.data,
            ability: abilityRes.data,
        };

        res.json({
            date,
            data: resultData,
        });
        
    }catch(err){
        console.error(err?.response?.data || err);
        res.status(500).json({message: '캐릭터 정보 조회 실패'});
    }
});



app.listen(PORT, () => console.log('서버가 5000번 포트에서 가동 중!'));