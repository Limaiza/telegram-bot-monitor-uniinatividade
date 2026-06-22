const db = require("../db");

module.exports = async (ctx) => {
  try {

    const member =
      ctx.message?.left_chat_member;

    if (!member) return;

    if (member.is_bot) return;

    await db.query(
      `
      UPDATE group_members
      SET
        is_active = FALSE,
        left_at = NOW()
      WHERE
        telegram_id = $1
        AND group_id = $2
      `,
      [
        member.id,
        ctx.chat.id
      ]
    );

  } catch (error) {
    console.error(
      "Erro ao registrar saída:",
      error
    );
  }
};