import * as uuid from 'uuid'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { getUserId } from '../utils/auth'
import { TodoItem } from '../models/todo'
import { CreateTodoRequest, UpdateTodoRequest } from '../models/requests'
import * as DataLayer from '../DL'

export async function getAllTodos(
  event: APIGatewayProxyEvent
): Promise<TodoItem[]> {
  const userId = getUserId(event)
  return DataLayer.getAllTodes(userId)
}

export async function createTodo(
  event: APIGatewayProxyEvent
): Promise<TodoItem> {
  const userId = getUserId(event)
  const parsedEvent = JSON.parse(event.body) as CreateTodoRequest
  if (!userId || !parsedEvent.name || !parsedEvent.dueDate)
    throw new Error('invalid request')
  const newTodo: CreateTodoRequest =
    typeof event.body === 'string' ? JSON.parse(event.body) : event.body

  return await DataLayer.createTodo({
    userId: userId,
    todoId: uuid.v4(),
    createdAt: new Date().toISOString(),
    done: false,
    ...newTodo
  })
}

export async function deleteTodo(event: APIGatewayProxyEvent) {
  const userId = getUserId(event)
  const todoId = event.pathParameters.todoId
  if (!todoId || !userId) throw new Error('invalid request')
  return await DataLayer.deleteTodo(todoId, userId)
}

export async function updateTodo(event: APIGatewayProxyEvent) {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  const parsedEvent = JSON.parse(event.body) as UpdateTodoRequest
  if (!todoId || !userId || !(parsedEvent.name || parsedEvent.dueDate))
    throw new Error('invalid request')
  const updatedTodo: UpdateTodoRequest = parsedEvent
  return await DataLayer.updateTodo(userId, todoId, updatedTodo)
}

export async function generateUploadUrl(event: APIGatewayProxyEvent) {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  if (!todoId || !userId) throw new Error('invalid request')
  return await DataLayer.generateUploadUrl(todoId, userId)
}
