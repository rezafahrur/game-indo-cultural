using IndonesianGame.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace IndonesianGame.Api.Data;

public static class SeedData
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (await db.Questions.AnyAsync()) return;

        void Q(string difficulty, string slug, string en, string zh,
               (string en, string zh, bool correct)[] opts)
        {
            var q = new Question
            {
                Id = Guid.NewGuid(),
                Difficulty = difficulty,
                ImageUrl = $"/images/{slug}.jpg",
                TextEn = en,
                TextZh = zh
            };
            foreach (var o in opts)
                q.Options.Add(new Option
                {
                    Id = Guid.NewGuid(),
                    TextEn = o.en,
                    TextZh = o.zh,
                    IsCorrect = o.correct
                });
            db.Questions.Add(q);
        }

        // ---------- EASY ----------
        Q("Easy", "rendang",
          "What is this Indonesian dish?", "这是什么印尼菜？",
          new (string, string, bool)[] {
            ("Rendang", "仁当", true),
            ("Satay", "沙爹", false),
            ("Soto", "印尼汤", false),
            ("Nasi goreng", "印尼炒饭", false),
          });

        Q("Easy", "satay",
          "What is this food?", "这是什么食物？",
          new (string, string, bool)[] {
            ("Satay", "沙爹", true),
            ("Rendang", "仁当", false),
            ("Dumpling", "饺子", false),
            ("Fried rice", "炒饭", false),
          });

        Q("Easy", "nasi-goreng",
          "What is this dish called?", "这道菜叫什么？",
          new (string, string, bool)[] {
            ("Nasi goreng", "印尼炒饭", true),
            ("Nasi padang", "巴东饭", false),
            ("Soto", "印尼汤", false),
            ("Satay", "沙爹", false),
          });

        Q("Easy", "borobudur",
          "Which temple is this?", "这是哪座寺庙？",
          new (string, string, bool)[] {
            ("Borobudur", "婆罗浮屠", true),
            ("Prambanan", "普兰巴南", false),
            ("Tanah Lot", "海神庙", false),
            ("Uluwatu", "乌鲁瓦图", false),
          });

        Q("Easy", "komodo",
          "Which Indonesian island is famous for this animal?",
          "这种动物以印尼哪个岛闻名？",
          new (string, string, bool)[] {
            ("Komodo", "科莫多岛", true),
            ("Bali", "巴厘岛", false),
            ("Java", "爪哇", false),
            ("Sumatra", "苏门答腊", false),
          });

        Q("Easy", "bali-rice-terrace",
          "Which island is this?", "这是哪个岛？",
          new (string, string, bool)[] {
            ("Bali", "巴厘岛", true),
            ("Lombok", "龙目岛", false),
            ("Java", "爪哇", false),
            ("Sulawesi", "苏拉威西", false),
          });

        Q("Easy", "angklung",
          "What is this instrument made of?", "这种乐器用什么制作？",
          new (string, string, bool)[] {
            ("Bamboo", "竹子", true),
            ("Metal", "金属", false),
            ("Wood", "木头", false),
            ("Leather", "皮革", false),
          });

        Q("Easy", "batik",
          "What is this Indonesian craft called?", "这种印尼工艺叫什么？",
          new (string, string, bool)[] {
            ("Batik", "蜡染", true),
            ("Ikat", "扎染", false),
            ("Weaving", "编织", false),
            ("Embroidery", "刺绣", false),
          });

        Q("Easy", "terima-kasih",
          "What does \"Terima kasih\" mean?", "“Terima kasih” 是什么意思？",
          new (string, string, bool)[] {
            ("Thank you", "谢谢", true),
            ("Sorry", "对不起", false),
            ("Hello", "你好", false),
            ("Goodbye", "再见", false),
          });

        Q("Easy", "selamat-pagi",
          "What does \"Selamat pagi\" mean?", "“Selamat pagi” 是什么意思？",
          new (string, string, bool)[] {
            ("Good morning", "早上好", true),
            ("Good night", "晚安", false),
            ("Good afternoon", "下午好", false),
            ("Goodbye", "再见", false),
          });

        // ---------- MEDIUM ----------
        Q("Medium", "tempeh",
          "What is this Indonesian food made from?", "这种印尼食物用什么做的？",
          new (string, string, bool)[] {
            ("Soybean", "大豆", true),
            ("Rice", "大米", false),
            ("Cassava", "木薯", false),
            ("Banana", "香蕉", false),
          });

        Q("Medium", "raja-ampat",
          "Which Indonesian region is famous for these islands?",
          "这些岛屿位于印尼哪个地区？",
          new (string, string, bool)[] {
            ("Raja Ampat", "四王群岛", true),
            ("Bali", "巴厘岛", false),
            ("Java", "爪哇", false),
            ("Sumatra", "苏门答腊", false),
          });

        Q("Medium", "wayang-kulit",
          "What is this?", "这是什么？",
          new (string, string, bool)[] {
            ("Shadow puppet", "皮影戏", true),
            ("Traditional dance", "传统舞蹈", false),
            ("Mask", "面具", false),
            ("Statue", "雕像", false),
          });

        Q("Medium", "gamelan",
          "What is this Indonesian music ensemble called?",
          "这种印尼音乐合奏叫什么？",
          new (string, string, bool)[] {
            ("Gamelan", "甘美兰", true),
            ("Angklung", "昂格隆", false),
            ("Kecapi", "拨弦乐器", false),
            ("Kolintang", "科林唐", false),
          });

        Q("Medium", "pulau",
          "What does \"Pulau\" mean?", "“Pulau” 是什么意思？",
          new (string, string, bool)[] {
            ("Island", "岛", true),
            ("Mountain", "山", false),
            ("Beach", "海滩", false),
            ("Forest", "森林", false),
          });

        Q("Medium", "merah-putih",
          "\"Merah Putih\" refers to what?", "“Merah Putih” 指的是什么？",
          new (string, string, bool)[] {
            ("The Indonesian flag", "印尼国旗", true),
            ("The national anthem", "国歌", false),
            ("A traditional house", "传统房屋", false),
            ("The currency", "货币", false),
          });

        await db.SaveChangesAsync();
    }
}