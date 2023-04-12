import Command from "../utils/discord/commandHandler";
import {ActionRowBuilder, ButtonBuilder, EmbedBuilder, GuildMember, PermissionsBitField, TextChannel} from "discord.js";
import configurableEmbed from "../utils/embeds/configurableEmbed";
import ticketScheme from "../schemes/ticketScheme";
import Config from "../types/config";
export default new Command({
    name: "create-ticket-message",
    description: "Create a ticket message",
    permissions: ["ADMINISTRATOR"],
    async run(interaction, config){
        const configSection = config["create-ticket-message"]
        const embed = configurableEmbed(configSection.embed)
        const button = new ButtonBuilder()
            .setStyle(1)
            .setLabel(configSection.button)
            .setCustomId("create-ticket")
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(button)
        await interaction.reply({ embeds: [embed], components: [row] })
    }
})

export function isTicketChannel(channelID: string) {
    return ticketScheme.exists({ channelID })
}

export function isUserStaff(user: GuildMember, config: Config) {
    const userRoles = user.roles.cache
    return user.permissions.has(PermissionsBitField.Flags.ManageRoles) || userRoles.has(config.general["staff-role"])
}