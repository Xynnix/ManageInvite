const Command = require("../../structures/Command.js");
const Constants = require("../../helpers/constants");
const { Constants: { ApplicationCommandOptionTypes } } = require("discord.js");

module.exports = class extends Command {
    constructor (client) {
        super(client, {
            name: "set-fake-threshold",
            enabled: true,
            aliases: [ "setfake-threshold", "setfake", "set-fake" ],
            clientPermissions: [ "EMBED_LINKS" ],
            permLevel: 2,

            slashCommandOptions: {
                description: "Sets the number of days before a member is considered a fake.",
                options: [
                    {
                        name: "set",
                        description: "Add or change the threshold",
                        type: ApplicationCommandOptionTypes.SUB_COMMAND,
                        options: [
                            {
                                name: "days",
                                description: "The number of days before a member is considered a fake.",
                                type: ApplicationCommandOptionTypes.INTEGER,
                                required: true
                            }
                        ]
                    },
                    {
                        name: "disable",
                        description: "Disable the threshold",
                        type: ApplicationCommandOptionTypes.SUB_COMMAND
                    }
                ]
            }
        });
    }

    async run (message, args) {
        const fakeThreshold = args[0];
        if (!fakeThreshold || (isNaN(fakeThreshold) && fakeThreshold !== "disable")) {
            return message.error("config/set-fake-threshold:MISSING_DAYS");
        }
        if (fakeThreshold === "disable") {
            await this.client.database.updateGuildSetting(message.guild.id, "fakeThreshold", null);
            message.success("config/set-fake-threshold:DISABLED");
        } else {
            const dayCount = parseInt(fakeThreshold);
            await this.client.database.updateGuildSetting(message.guild.id, "fakeThreshold", dayCount);
            message.success("config/set-fake-threshold:UPDATED", {
                dayCount
            });
        }
    }

    async runInteraction (interaction) {

        const action = interaction.options.getSubCommand();

        if (action === "disable") {
            await this.client.database.updateGuildSetting(interaction.guild.id, "fakeThreshold", null);
            interaction.reply({ content: Constants.Emojis.SUCCESS + " " + interaction.guild.translate("config/set-fake-threshold:DISABLED") });
        } else if (action === "set") {
            const dayCount = interaction.options.getInteger("days");
            await this.client.database.updateGuildSetting(interaction.guild.id, "fakeThreshold", dayCount);
            interaction.reply({ content: Constants.Emojis.SUCCESS + " " + interaction.guild.translate("config/set-fake-threshold:UPDATED", {
                dayCount
            }) });
        }
    }
};
