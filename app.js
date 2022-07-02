class Person {
    constructor(name, surname, mail) {
        this.name = name
        this.surname = surname
        this.mail = mail
    }
}

class Util {
    static emptyValueControl(...values) {
        let result = true
        values.forEach(value => {
            if(value.length === 0){
                result = false
                return false
            }
        })
        return result
    }

    static isValidEmail(mail) {
        return String(mail)
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    }
}

class UI {
    constructor() {
        this.name = document.getElementById('name')
        this.surname = document.getElementById('surname')
        this.mail = document.getElementById('mail')
        this.submitUpdateButton = document.querySelector('.submitUpdate')
        this.form = document.getElementById('form-book')
        this.form.addEventListener('submit', this.submitUpdate.bind(this)) // this olarak form yerine object
        this.personList = document.querySelector('.person-list')
        this.personList.addEventListener('click', this.updateOrDelete.bind(this))
        this.db = new DB()
        this.selectedRow = undefined
        this.printPersons()
    }

    clearWindow() {
        this.name.value = ''
        this.surname.value = ''
        this.mail.value = ''
    }

    updateOrDelete(e) {
        const clicked = e.target
        if(clicked.classList.contains('btn--delete')) {
            this.selectedRow = clicked.parentElement.parentElement
            this.deletePersonWindow()
        }else if(clicked.classList.contains('btn--edit')) {
            this.selectedRow = clicked.parentElement.parentElement
            this.submitUpdateButton.value = 'Update'
            this.name.value = this.selectedRow.cells[0].textContent
            this.surname.value = this.selectedRow.cells[1].textContent
            this.mail.value = this.selectedRow.cells[2].textContent
        }
    }

    printPersons() {
        this.db.persons.forEach(person => {
            this.addPersonWindow(person)
        })
    }

    updatePersonWindow(person) {
        const result = this.db.updatePerson(person, this.selectedRow.cells[2].textContent)    
        if(result) {
            this.selectedRow.cells[0].textContent = person.name
            this.selectedRow.cells[1].textContent = person.surname
            this.selectedRow.cells[2].textContent = person.mail
            
            this.clearWindow()
            this.selectedRow = undefined
            this.submitUpdateButton.value = 'Submit'
            this.createInfo('Person is updated', true)
        }else {
            this.createInfo('This e-mail is in use!', false)       
        }
    }

    deletePersonWindow() {
        this.selectedRow.remove()
        const deletedMail = this.selectedRow.cells[2].textContent
        this.db.deletePerson(deletedMail)
        this.clearWindow()
        this.selectedRow = undefined
        this.createInfo('Person is deleted from book', true)

    }

    addPersonWindow(person) {
        const createdTr = document.createElement('tr')
        createdTr.innerHTML = `<td>${person.name}</td>
        <td>${person.surname}</td>
        <td>${person.mail}</td>
        <td>
            <button class="btn btn--edit"><i class="fa-solid fa-edit"></i></button>
            <button class="btn btn--delete"><i class="fa-solid fa-trash-can"></i></button>
        </td>`

        this.personList.appendChild(createdTr)
        this.clearWindow()
    }

    submitUpdate(e) {
        e.preventDefault()
        const person = new Person(this.name.value, this.surname.value, this.mail.value)
        const result = Util.emptyValueControl(person.name, person.surname, person.mail)
        const isValidMail = Util.isValidEmail(this.mail.value)
        if(result) {
            if(!isValidMail) {
                this.createInfo('Please write valid e-mail!', false)
            }else {
                if(this.selectedRow) {
                    this.updatePersonWindow(person)
                }else {
                    const result = this.db.addPerson(person)
                    if(result) {
                        this.createInfo('Person is added successfully', true)
                        this.addPersonWindow(person)
                        
                    }else {
                        this.createInfo('This e-mail is in use!', false)       
                    }
                }
            }
        }else {
            this.createInfo('Please fill in all the blanks!', false)
        }
    }
    
    createInfo(msg, status) {
        const warning = document.querySelector('.info')
        warning.innerHTML = msg
        warning.classList.add(status ? 'info--success' : 'info--error')
        
        setTimeout(function () {
            warning.className = 'info'
        }, 2000)
    }
}

class DB {
    
    constructor() {
        this.persons = this.getPersons()
    }

    isEmailUnique(mail) {
        const result = this.persons.find(person => {
            return person.mail === mail
        })

        if(result) {
            return false
        } else {
            return true
        }
    }

    getPersons() {
        let personsLocal = []
        if(localStorage.getItem('persons') === null) {
            personsLocal = []
        }else {
            personsLocal = JSON.parse(localStorage.getItem('persons'))
        }
        return personsLocal
    }

    addPerson(person) {
        if(this.isEmailUnique(person.mail)) {
            this.persons.push(person)
            localStorage.setItem('persons', JSON.stringify(this.persons))  
            return true
        } else {
            return false
        }
    }

    deletePerson(mail) {
        this.persons.forEach((person, index) => {
            if(person.mail === mail) {
                this.persons.splice(index, 1)
            }
        })
        localStorage.setItem('persons', JSON.stringify(this.persons))       
    }

    updatePerson(updatedPerson, mail) {
        if(updatedPerson.mail === mail) {
            this.persons.forEach((person, index) => {
                if(person.mail === mail) {
                    this.persons[index] = updatedPerson
                    localStorage.setItem('persons', JSON.stringify(this.persons))    
                    return true
                }
            })
            return true           
        }
        if(this.isEmailUnique(updatedPerson.mail)) {
            this.persons.forEach((person, index) => {
                if(person.mail === mail) {
                    this.persons[index] = updatedPerson
                    localStorage.setItem('persons', JSON.stringify(this.persons))    
                    return true
                }
            })
            return true
        }else {
            return false
        }
    }
}

document.addEventListener('DOMContentLoaded', function (e) {
    const window = new UI()
})