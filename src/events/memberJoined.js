const db = require("../db");

module.exports = async (ctx) => {
  try {
    if (!ctx.message?.new_chat_members) return;

    const members = ctx.message.new_chat_members;

    for (const member of members) {

      if (member.is_bot) continue;

      await db.query(
        `
        INSERT INTO group_members (
          telegram_id,
          group_id,
          username,
          first_name,
          last_name,
          joined_at,
          is_active
        )
        VALUES (
          $1,$2,$3,$4,$5,
          NOW(),
          TRUE
        )
        ON CONFLICT (
          telegram_id,
          group_id
        )
        DO UPDATE SET
          username = EXCLUDED.username,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          joined_at = NOW(),
          left_at = NULL,
          is_active = TRUE
        `,
        [
          member.id,
          ctx.chat.id,
          member.username || null,
          member.first_name || null,
          member.last_name || null
        ]
      );
    }

  } catch (error) {
    console.error(
      "Erro ao registrar entrada:",
      error
    );
  }
};