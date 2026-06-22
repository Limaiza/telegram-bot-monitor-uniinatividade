module.exports =
async function isAdmin(ctx) {

  try {

    const member =
      await ctx.telegram.getChatMember(
        ctx.chat.id,
        ctx.from.id
      );

    return [
      "creator",
      "administrator"
    ].includes(
      member.status
    );

  } catch (error) {

    console.error(
      "Erro ao verificar admin:",
      error
    );

    return false;
  }
};