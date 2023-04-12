import Button from "../utils/discord/buttonHandler";
import configurableEmbed from "../utils/embeds/configurableEmbed";
import {ButtonInteraction, CacheType, PermissionsBitField, TextChannel, User} from "discord.js";
import ticketScheme from "../schemes/ticketScheme";
import config from "../types/config";
import Config from "../types/config";

export default new Button({
    name: "create-ticket",
    run: async (interaction, config) => {
        const maxTicketPerUser = config.general["max-tickets"]
        if(await getLengthOfUserTickets(interaction.user.id) >= maxTicketPerUser){
            const ticketLimit = config["ticket-limit"]
            const limitEmbed = configurableEmbed(ticketLimit)
            await interaction.reply({embeds: [limitEmbed], ephemeral: true})
            return
        }
        const ticketChannel = await createTicket(interaction, config)
        await sendFirstMessages(ticketChannel, config)
    }
})
async function sendFirstMessages(channel: TextChannel, config: Config) {
    const ticketFirstMessage = config["ticket-first-message"]
    const firstMessageEmbed = configurableEmbed(ticketFirstMessage)
    await channel.send({ embeds: [firstMessageEmbed] })
    if(config.general["ping-staffs"]){
        await channel.send(`<@&${config.general["staff-role"]}>`)
    }
}
async function createTicket(interaction: ButtonInteraction<CacheType>, config: config) {
    let category = (await interaction.guild!.channels.fetch()).find(channel => channel?.name === config.general["ticket-category"])
    if(category == null || category.type !== 4){
        category = await interaction.guild!.channels.create({
            name: config.general["ticket-category"],
            type: 4, // Category
            permissionOverwrites: [
                {
                    id: config.general["staff-role"],
                    allow: PermissionsBitField.Flags.ViewChannel,
                },
                {
                    id: interaction.guild!.roles.everyone,
                    deny: PermissionsBitField.Flags.ViewChannel,
                }
            ]
        })
    }
    const channel = await interaction.guild!.channels.create({
        parent: category?.id,
        name: replacePlaceholdersForUser(config.general["ticket-format"], interaction.user),
        type: 0, // Text channel
        permissionOverwrites: [
            {
                id: config.general["staff-role"],
                allow: PermissionsBitField.Flags.ViewChannel,
            },
            {
                id: interaction.user.id,
                allow: PermissionsBitField.Flags.ViewChannel,
            },
            {
                id: interaction.guild!.roles.everyone,
                deny: PermissionsBitField.Flags.ViewChannel,
            }
        ]
    })
    const ticketCreated = config["ticket-created"]
    const ticketCreatedEmbed = configurableEmbed(ticketCreated)
    await interaction.reply({ embeds: [ticketCreatedEmbed], ephemeral: true })
    await ticketScheme.create({
        ownerID: interaction.user.id,
        channelName: channel.name,
        channelID: channel.id,
    })
    return channel
}
function getLengthOfUserTickets(ownerID: string){
    return ticketScheme.find({ ownerID }).countDocuments().exec()
}

function replacePlaceholdersForUser(format: string, user: User){
    return format
        .replace("{user}", user.username)
        .replace("{user-id}", user.id)
        .replace("{user-tag}", user.tag)
        .replace("{user-discriminator}", user.discriminator)
}