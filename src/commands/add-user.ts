import Command from "../utils/discord/commandHandler";
import {isTicketChannel, isUserStaff} from "./create-ticket-message";
import configurableEmbed from "../utils/embeds/configurableEmbed";
import {GuildChannel, GuildTextBasedChannel, PermissionsBitField} from "discord.js";

export default new Command({
    name: "add-user",
    description: "Add a user to the ticket",
    permissions: [],
    options: [{
        name: "user",
        description: "The user to add",
        type: "user",
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
        const userToAdd = interaction.options.getUser("user", true);
        const ticketChannel = await interaction.channel! as GuildChannel
        if(ticketChannel.permissionOverwrites.cache.has(userToAdd.id)){
            const alreadyAdded = config["already-added"]
            const alreadyAddedEmbed = configurableEmbed(alreadyAdded)
            await interaction.reply({embeds: [alreadyAddedEmbed], ephemeral: true})
            return
        }
        await ticketChannel.permissionOverwrites.create(userToAdd.id, {
            ViewChannel: true
        })
        const userAdded = config["user-added"]
        const userAddedEmbed = configurableEmbed(userAdded)
        await interaction.reply({embeds: [userAddedEmbed]})
    }
})