/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */

const Chat = use('App/Models/Chat');
const ChatMessages = use('App/Models/ChatMessage');
const UnauthorizedException = use('App/Exceptions/UnauthorizedException');
const uuid = require('uuid');
const { chatStatusesTypes, chatMessagesTypes } = require('../../Utils');
const { errors, errorPayload } = require('../../Utils');

/**
 * Resourceful controller for interacting with the chats in general
 */
class ChatController {
	/**
	 * Get or create the chat when is not created yet
	 */
	async show({ request, auth }) {
		const { target_user, object_id, object_type } = request.only([
			'target_user',
			'object_type',
			'object_id',
		]);

		const user = await auth.getUser();

		const isChatAlreadyCreated = await Chat.query()
			.where({ object_id, object_type })
			.whereRaw('JSON_CONTAINS(participants, "?", "$")', [user.id])
			.whereRaw('JSON_CONTAINS(participants, "?", "$")', [parseInt(target_user, 10)])
			.first();

		if (isChatAlreadyCreated) {
			return isChatAlreadyCreated.toJSON();
		}

		const newChat = await Chat.create({
			status: chatStatusesTypes.ACTIVE,
			object_id,
			object_type,
			participants: JSON.stringify([user.id, parseInt(target_user, 10)]),
		});

		return newChat.toJSON();
	}

	/**
	 * Get the chat messages lists
	 */
	async index({ request, response, auth }) {
		const { offset = 0 } = request.only(['offset']);

		if (!uuid.validate(request.params.id)) {
			return response
				.status(400)
				.send(
					errorPayload(
						errors.BAD_FORMATTED_ID,
						request.antl('error.chat.badFormattedId'),
					),
				);
		}

		const user = await auth.getUser();

		const AmIAllowedToSeeMessage = await Chat.query()
			.where({ id: request.params.id })
			.whereRaw('JSON_CONTAINS(participants, "?", "$")', [user.id])
			.first();

		if (!AmIAllowedToSeeMessage) {
			throw new UnauthorizedException();
		}

		const messages = await ChatMessages.query()
			.where({
				chat_id: request.params.id,
			})
			.offset(Number(offset))
			.limit(10)
			.orderBy('id', 'desc')
			.fetch();

		return messages;
	}

	/**
	 * Store the chat message for a given chat
	 */
	async store({ request, auth, response }) {
		const { content } = request.only(['content']);

		if (!uuid.validate(request.params.id)) {
			return response
				.status(400)
				.send(
					errorPayload(
						errors.BAD_FORMATTED_ID,
						request.antl('error.chat.badFormattedId'),
					),
				);
		}

		const user = await auth.getUser();

		const AmIAllowedToSeeMessage = await Chat.query()
			.where({ id: request.params.id })
			.whereRaw('JSON_CONTAINS(participants, "?", "$")', [user.id])
			.first();

		if (!AmIAllowedToSeeMessage) {
			throw new UnauthorizedException();
		}

		const newMessage = await ChatMessages.create({
			content: JSON.stringify(content),
			type: chatMessagesTypes.TEXT,
			from_user_id: user.id,
			chat_id: request.params.id,
		});

		return newMessage;
	}
}

module.exports = ChatController;
