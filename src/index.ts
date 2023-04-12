import Config from "./types/config";
import discord, {
    ButtonInteraction, CacheType,
    EmbedBuilder,
    GuildChannel,
    GuildChannelTypes,
    PermissionsBitField
} from "discord.js"
import process from "process"
import dotenv from "dotenv-safe"
import yaml from "yaml"
import fs from "fs"
import {InteractionCommand, listCommands} from "./utils/discord/commandHandler"
import deployCommands from "./utils/discord/deployCommands"
import mongoose from "mongoose";
import {stringToPerm} from "./utils/discord/discordPermissions";
import configurableEmbed from "./utils/embeds/configurableEmbed";
import ticketScheme from "./schemes/ticketScheme";
import {listButtons} from "./utils/discord/buttonHandler";
process.on('uncaughtException', (err) => {
    console.error(err)
})

dotenv.config()
mongoose.connect(process.env.MONGO_URL as string);
let config = yaml.parse(fs.readFileSync("./config.yml", "utf-8")) as Config

const commands = new Map<string, (interaction: InteractionCommand, config: Config) => void>;
const buttons = new Map<string, (interaction: ButtonInteraction<CacheType>, config: Config) => void>;
const client = new discord.Client({
    intents: ["Guilds"]
})
client.on("ready", async () => {

    const commandList = (await listCommands()).map(command => command.default)
    const buttonList = (await listButtons()).map(button => button.default)
    for(let command of commandList){
        commands.set(command.name, command.run)
    }
    for(let button of buttonList){
        buttons.set(button.name, button.run)
    }
    await deployCommands(commandList, client, [])
})

client.on('interactionCreate', async(interaction) => {

    if(interaction.isChatInputCommand()){
        const { commandName } = interaction
        const commandFunction = commands.get(commandName)
        if(commandFunction !== undefined){
            commandFunction(interaction, config)
        }
    }

    if(interaction.isButton()){
        const { customId } = interaction
        const buttonFunction = buttons.get(customId)
        if(buttonFunction !== undefined){
            buttonFunction(interaction, config)
        }
    }
})

client.login(process.env.TOKEN as string)