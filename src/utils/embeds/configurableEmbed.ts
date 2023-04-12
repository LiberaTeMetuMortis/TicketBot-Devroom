import {EmbedBuilder} from "discord.js";
import Config, {Embed} from "../../types/config";

export default function( embed: Embed ): EmbedBuilder {
    const { title, description, color } = embed
    const embedBuilder = new EmbedBuilder()
    embedBuilder.setColor(parseInt(color, 16))
    embedBuilder.setDescription(description)
    embedBuilder.setTitle(title)
    return embedBuilder
}