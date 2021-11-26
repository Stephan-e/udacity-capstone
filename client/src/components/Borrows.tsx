import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createBorrow, deleteBorrow, getBorrows, patchBorrow } from '../api/borrows-api'
import Auth from '../auth/Auth'
import { Borrow } from '../types/Borrow'

interface BorrowsProps {
  auth: Auth
  history: History
}

interface BorrowsState {
  borrows: Borrow[]
  newBorrowName: string
  loadingBorrows: boolean
}

export class Borrows extends React.PureComponent<BorrowsProps, BorrowsState> {
  state: BorrowsState = {
    borrows: [],
    newBorrowName: '',
    loadingBorrows: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBorrowName: event.target.value })
  }

  onEditButtonClick = (borrowId: string) => {
    this.props.history.push(`/borrows/${borrowId}/edit`)
  }

  onBorrowCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const borrowDate = this.calculateDueDate()
      const newBorrow = await createBorrow(this.props.auth.getIdToken(), {
        name: this.state.newBorrowName,
        borrowDate
      })
      this.setState({
        borrows: [...this.state.borrows, newBorrow],
        newBorrowName: ''
      })
    } catch {
      alert('New item creation failed')
    }
  }

  onBorrowDelete = async (borrowId: string) => {
    try {
      await deleteBorrow(this.props.auth.getIdToken(), borrowId)
      this.setState({
        borrows: this.state.borrows.filter(borrow => borrow.borrowId !== borrowId)
      })
    } catch {
      alert('Borrow deletion failed')
    }
  }

  onBorrowCheck = async (pos: number, state: string) => {
    try {
      const borrow = this.state.borrows[pos]
      var remind = borrow.remind
      var returned = borrow.returned

      if (state ==='remind')
        remind = !borrow.remind  
      if (state ==='returned')
        returned = !borrow.returned   

      await patchBorrow(this.props.auth.getIdToken(), borrow.borrowId, {
        name: borrow.name,
        borrowDate: borrow.borrowDate,
        returned: returned,
        remind: remind
      })
      if (state ==='remind')
      this.setState({
        borrows: update(this.state.borrows, {
          [pos]: { 
            remind: { $set: !borrow.remind }
         }
        })
      })
      if (state ==='returned')
      this.setState({
        borrows: update(this.state.borrows, {
          [pos]: { 
            returned: { $set: !borrow.returned },
         }
        })
      })
      
    } catch {
      alert('Borrow deletion failed')
    }
  }
  

  async componentDidMount() {
    try {
      const borrows = await getBorrows(this.props.auth.getIdToken())
      this.setState({
        borrows,
        loadingBorrows: false
      })
    } catch (e) {
      alert(`Failed to fetch borrows: ${e}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Who's got my shoe?</Header>
        <Header as="h5">Don't you just hate it when you borrowed someone something, and they never returned it? </Header>
        <p>Now, with <strong>Who's got my shoe?</strong> you can track down those borrowers with a handy tool that remembers what item you lent to who. </p>
        <p>For the Passive Agressive types, you can send the borrower an strongly worded email 
          to remind them of the item they borrowed and also to inform them of the unwritten but sacred rules 
          of informal borrowing. [Not functional due to AWS SES email and SMS sign up registration/verification.] </p> 


        {this.renderCreateBorrowInput()}

        {this.renderBorrows()}
      </div>
    )
  }

  renderCreateBorrowInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
        <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'Add an item.',
              onClick: this.onBorrowCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Gameboy Color to Shigeru Miyamoto"
            onChange={this.handleNameChange}
          />

        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderBorrows() {
    if (this.state.loadingBorrows) {
      return this.renderLoading()
    }

    return this.renderBorrowsList()
  }

  getBgColor(status: boolean) {
    if (status)
      return '#c5edc6'
    else
      return "#ffffff"

  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Who's got your shoe....
        </Loader>
      </Grid.Row>
    )
  }

  renderBorrowsList() {
    return (
      <Grid padded>
        {this.state.borrows.map((borrow, pos) => {
          return (
            <Grid.Row key={borrow.borrowId} style={{backgroundColor: this.getBgColor(borrow.returned), borderRadius: "10px", marginBottom: '1vw'}}>
              {/* <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onBorrowCheck(pos)}
                  checked={borrow.returned}
                />
              </Grid.Column> */}
              <Grid.Column width={3} verticalAlign="middle">
                {borrow.name}
              </Grid.Column>
              <Grid.Column width={2} floated="right" verticalAlign="middle">
                {borrow.borrowDate}
              </Grid.Column>
              <Grid.Column width={2} floated="right" verticalAlign="middle">
                <Button
                  icon
                  disabled={borrow.remind}
                  color={borrow.remind?"grey":"green"}
                  onClick={() => this.onBorrowCheck(pos, 'remind')}
                >
                  <Icon name="bell" /> Remind
                </Button>
              </Grid.Column>
              <Grid.Column width={2} floated="right" verticalAlign="middle">
                <Button
                  icon
                  color={borrow.returned?"orange":"green"}
                  onClick={() => this.onBorrowCheck(pos, 'returned')}
                >
                  <Icon name="arrow alternate circle down" /> Return
                </Button>
              </Grid.Column>
              <Grid.Column width={2} floated="right" verticalAlign="middle">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(borrow.borrowId)}
                >
                  <Icon name="image outline" />
                  Upload
                </Button>
              </Grid.Column>
              <Grid.Column width={2} floated="right" verticalAlign="middle">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onBorrowDelete(borrow.borrowId)}
                >
                  <Icon name="cut" />
                  Let go 
                </Button>
              </Grid.Column >
              <Grid.Column width={3}>
              {borrow.attachmentUrl && (
                <Image src={borrow.attachmentUrl} size="small" wrapped />
              )}
               </Grid.Column>
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
             
            </Grid.Row>
          )
        })}

      </Grid>
    )
  }

  calculateDueDate(): string {
    const borrowDate = new Date()
    borrowDate.setDate(borrowDate.getDate() + 7)

    return dateFormat(borrowDate, 'yyyy-mm-dd') as string
  }
}
