import Command from "../utils/discord/commandHandler";
import {isTicketChannel, isUserStaff} from "./create-ticket-message";
import configurableEmbed from "../utils/embeds/configurableEmbed";
import {GuildChannel} from "discord.js";

export default new Command({
    name: "remove-user",
    description: "Remove a user from the ticket",
    permissions: [],
    options: [{
        name: "user",
        description: "The user to remove",
        type: "user"
    }],
    async run(interaction, config){
        if(!isTicketChannel(interaction.channelId)) {
            const notTicketChannel = config["not-ticket-channel"]
            const notTicketEmbed = configurableEmbed(notTicketChannel)
            await interaction.reply({embeds: [notTicketEmbed], ephemeral: true})
            return
        }
        const senderMember = await interaction.guild!.members.fetch(interaction.user.id)
        if(!isUserStaff(senderMember, config)) {
            const notStaff = config["not-staff"]
            const notStaffEmbed = configurableEmbed(notStaff)
            await interaction.reply({embeds: [notStaffEmbed], ephemeral: true})
            return
        }
        const userToRemove = interaction.options.getUser("user", true);
        const ticketChannel = await interaction.channel! as GuildChannel
        if(!ticketChannel.permissionOverwrites.cache.has(userToRemove.id)){
            const notAdded = config["not-added"]
            const notAddedEmbed = configurableEmbed(notAdded)
            await interaction.reply({embeds: [notAddedEmbed], ephemeral: true})
            return
        }
        await ticketChannel.permissionOverwrites.delete(userToRemove.id)
        const userRemoved = config["user-removed"]
        const userRemovedEmbed = configurableEmbed(userRemoved)
        await interaction.reply({embeds: [userRemovedEmbed]})
    }
})