const express = require('express')
const app = express()
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
var format = require('date-fns/format')
const isMatch = require('date-fns/isMatch')
const isValid = require('date-fns/isValid')
const datapath = path.join(__dirname, 'todoApplication.db')
app.use(express.json())
let db = null
const initialization = async () => {
  try {
    db = await open({
      filename: datapath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('success')
    })
  } catch (e) {
    console.log(`${e.message}`)
    process.exit(1)
  }
}
initialization()
const y = dataobject => {
  return {
    id: dataobject.id,
    todo: dataobject.todo,
    priority: dataobject.priority,
    status: dataobject.status,
    category: dataobject.category,
    dueDate: dataobject.due_date,
  }
}
const hasStatusAndPriority = balu =>
  balu.status !== undefined && balu.priority !== undefined

const hasStatus = balu => {
  return balu.status !== undefined
}
const hasPriority = balu => {
  return balu.priority !== undefined
}
const hasCategoryAndStatus = balu => {
  return balu.category !== undefined && balu.status !== undefined
}
const hasSearch = balu => {
  return balu.search_q !== undefined
}
const hasCategory = balu => balu.category !== undefined
const hasCategoryAndPriority = balu => {
  return balu.category !== undefined && balu.priority !== undefined
}
app.get('/todos/', async (request, response) => {
  let database = null
  let c = ''
  const {search_q = '', status, priority, category} = request.query
  switch (true) {
    case hasStatusAndPriority(request.query):
      if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
        if (
          priority === 'HIGH' ||
          priority === 'MEDIUM' ||
          priority === 'LOW'
        ) {
          c = `SELECT *
                             FROM todo
                             WHERE status="${status}" AND priority="${priority}";`
          database = await db.all(c)

          response.send(database.map(eachTodo => y(eachTodo)))
        } else {
          response.status(400)
          response.send('Invalid Todo Priority')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break
    case hasStatus(request.query):
      if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
        c = `SELECT *
                         FROM todo
                         WHERE status="${status}";`
        database = await db.all(c)
        response.send(database.map(eachTodo => y(eachTodo)))
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break
    case hasPriority(request.query):
      if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
        const k = `SELECT *
                         FROM todo
                         WHERE priority="${priority}";`
        database = await db.all(k)
        response.send(database.map(eachTodo => y(eachTodo)))
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break
    case hasSearch(request.query):
      const v = `SELECT *
                FROM todo
                WHERE todo LIKE "%${search_q}%";`
      database = await db.all(v)

      response.send(database.map(eachTodo => y(eachTodo)))
      break
    case hasCategoryAndStatus(request.query):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        if (
          status === 'TO DO' ||
          status === 'IN PROGRESS' ||
          status === 'DONE'
        ) {
          const v = `SELECT *
                             FROM todo
                             WHERE category="${category}" AND status="${status}";`
          database = await db.all(v)
          response.send(database.map(eachTodo => y(eachTodo)))
        } else {
          response.status(400)
          response.send('Invalid Todo Status')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    case hasCategory(request.query):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        const h = `SELECT *
                 FROM todo
                 WHERE category LIKE "${category}";`
        database = await db.all(h)
        response.send(database.map(eachTodo => y(eachTodo)))
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    case hasCategoryAndPriority(request.query):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        if (
          priority === 'HIGH' ||
          priority === 'MEDIUM' ||
          priority === 'LOW'
        ) {
          const b = `SELECT *
                    FROM todo
                    WHERE category="${category}" AND priority="${priority}";`
          database = await db.all(b)
          response.send(database.map(eachTodo => y(eachTodo)))
        } else {
          response.status(400)
          response.send('Invalid Todo Priority')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
  }
})
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const g = `SELECT *
           FROM todo
           WHERE id=${todoId};`
  const o = await db.get(g)
  response.send(y(o))
})
app.get('/agenda/', async (request, response) => {
  const {date} = request.query

  if (isMatch(date, 'yyyy-MM-dd')) {
    const v = format(new Date(date), 'yyyy-MM-dd')
    console.log(v)

    const m = `SELECT *
             FROM todo
             WHERE due_date="${v}";

             `
    const i = await db.all(m)
    response.send(i.map(eachTodo => y(eachTodo)))
  } else {
    response.status(400)
    response.send('Invalid Due Date')
  }
})
app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status, category, dueDate} = request.body
  if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
    if (category === 'WORK' || category === 'HOME' || category === 'LEARNING') {
      if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
        if (isMatch(dueDate, 'yyyy-MM-dd')) {
          const v = format(new Date(dueDate), 'yyyy-MM-dd')
          const f = `INSERT INTO todo (id,todo,category,priority,status,due_date)
                   VALUES (${id},"${todo}","${category}","${priority}","${status}","${v}");`
          const h = await db.run(f)
          response.send('Todo Successfully Added')
        } else {
          response.status(400)
          response.send('Invalid Due Date')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
    } else {
      response.status(400)
      response.send('Invalid Todo Category')
    }
  } else {
    response.status(400)
    response.send('Invalid Todo Status')
  }
})
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const requestBody = request.body
  let updatedColumn = ''
  const x = `SELECT *
           FROM todo
           WHERE id=${todoId};`
  const v = await db.get(x)
  const {
    status = v.status,
    todo = v.todo,
    priority = v.priority,
    category = v.category,
    dueDate = v.due_date,
  } = request.body
  if (requestBody.status !== undefined) {
    if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
      updatedColumn = 'Status Updated'
      const u = `UPDATE todo
               SET status="${status}",
                   todo="${todo}",
                   category="${category}",
                   priority="${priority}",
                   due_date="${dueDate}"
              WHERE id=${todoId};`
      const status_updated = await db.run(u)
      response.send(updatedColumn)
    } else {
      response.status(400)
      response.send('Invalid Todo Status')
    }
  }
  if (requestBody.priority !== undefined) {
    if (priority === 'HIGH' || priority === 'LOW' || priority === 'MEDIUM') {
      updatedColumn = 'Priority Updated'
      const g = `UPDATE todo
               SET status="${status}",
                   todo="${todo}",
                   category="${category}",
                   priority="${priority}",
                   due_date="${dueDate}"
              WHERE id=${todoId};`
      const j = await db.run(g)
      response.send(updatedColumn)
    } else {
      response.status(400)
      response.send('Invalid Todo Priority')
    }
  }
  if (requestBody.category !== undefined) {
    if (category === 'WORK' || category === 'HOME' || priority === 'LEARNING') {
      updatedColumn = 'Category Updated'
      const g = `UPDATE todo
               SET status="${status}",
                   todo="${todo}",
                   category="${category}",
                   priority="${priority}",
                   due_date="${dueDate}"
              WHERE id=${todoId};`
      const j = await db.run(g)
      response.send(updatedColumn)
    } else {
      response.status(400)
      response.send('Invalid Todo Category')
    }
  }
  if (requestBody.dueDate !== undefined) {
    if (isMatch(dueDate, 'yyyy-MM-dd')) {
      const joy = format(new Date(dueDate), 'yyyy-MM-dd')
      const s = `UPDATE todo
                 SET status="${status}",
                 todo="${todo}",
                 category="${category}",
                 due_date="${joy}"
                 WHERE id=${todoId};
                 `
      const z = await db.run(s)
      response.send('Due Date Updated')
    } else {
      response.status(400)
      response.send('Invalid Due Date')
    }
  }
  if (requestBody.todo !== undefined) {
    const o = `UPDATE todo
    SET status="${status}",
                 todo="${todo}",
                 category="${category}",
                 due_date="${v}"
                 WHERE id=${todoId};
              
            `
    const z = await db.run(o)
    response.send('Todo Updated')
  }
})
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const i = `DELETE 
          FROM todo
          WHERE id=${todoId};`
  const z = await db.run(i)
  response.send('Todo Deleted')
})

module.exports = app
