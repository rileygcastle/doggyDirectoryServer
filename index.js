const express = require("express")
const app = express()
const cors = require("cors")
const bodyParser = require("body-parser")
const fsPromises = require("fs").promises
const uuid = require("uuid")

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const writeData = async (data) =>
  fsPromises.writeFile("puppies.json", JSON.stringify(data))

const readData = async () => {
  const data = await fsPromises.readFile("puppies.json")
  return JSON.parse(data)
}

app.post("/", async (req, res) => {
  console.log(req.body)
  const { name, breed, personality, imageUrl } = req.body
  if (!name || !breed || !personality || !imageUrl) {
    return res
      .status(400)
      .send({ status: "error", message: "all feilds required" })
  }
  const id = uuid.v4()
  const newPuppy = { name, breed, personality, imageUrl, id }
  const puppies = await readData()
  puppies.push(newPuppy)
  await writeData(puppies)
  return res.send({
    status: "success",
    message: "puppy created",
    puppy: newPuppy,
  })
})

app.get("/", async (req, res) => {
  const allPuppies = await readData()
  return res.send({
    status: "sucess",
    message: "Puppies found!",
    puppies: allPuppies,
  })
})

app.get("/:id", async (req, res) => {
  const puppyId = req.params.id
  const allPuppies = await readData()
  const puppyFound = allPuppies.find((puppy) => puppy.id === puppyId)
  return res.send({
    status: "success",
    message: "puppy found!",
    puppy: puppyFound,
  })
})

app.delete("/:id", async (req, res) => {
  const puppyId = req.params.id
  const puppies = await readData()
  const filteredPuppies = puppies.filter((puppy) => {
    return puppy.id !== puppyId
  })
  await writeData(filteredPuppies)
  return res.send({ status: "success", message: "puppy deleted", id: puppyId })
})

app.put("/:id", async (req, res) => {
  console.log(req.body)
  const puppyId = req.params.id
  const { name, breed, personality, imageUrl } = req.body
  if (!name || !breed || !personality || !imageUrl) {
    return res
      .status(400)
      .send({ status: "error", message: "all feilds required" })
  }
  const newPuppyData = { name, breed, personality, imageUrl }
  const updatedPuppy = { ...newPuppyData, id: puppyId }
  const allPuppies = await readData()
  const updatedPuppies = allPuppies.map((puppy) => {
    if (puppy.id === puppyId) {
      return updatedPuppy
    }
    return puppy
  })
  await readData(updatedPuppies)
  return res.send({
    status: "success",
    message: "updated puppy",
    puppy: updatedPuppy,
  })
})

app.listen(8000)
