import React, { useState } from 'react'
import moment from 'moment'
import copy from "copy-to-clipboard"
import upvote from "../../assets/sort-up.svg"
import downvote from "../../assets/sort-down.svg"
import './Question.css'
import Avatar from '../../Component/Avatar/Avatar'
import Displayanswer from './Displayanswer'
import { useSelector, useDispatch } from "react-redux"
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom'
import {deletequestion,editquestion,votequestion,postanswer} from '../../action/question'

const Questiondetails = () => {
  const [answer, setanswer] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editBody, setEditBody] = useState("")
  const [editTags, setEditTags] = useState("")
  const dispatch=useDispatch()
  const questionlist=useSelector((state)=>state.questionreducer)
  const { id } = useParams();
    const user =useSelector((state)=>state.currentuserreducer)
    const location=useLocation()
    const navigate=useNavigate()
    const url="http://localhost:3000"

  const handlepostans = (e, answerlength) => {
    e.preventDefault();
    if (user === null) {
      alert("Login or Signup to answer a question")
      navigate('/Auth')
    } else {
      if (answer === "") {
        alert("Enter an answer before submitting")
      } else {
        dispatch(postanswer({
          id,
          noofanswers: answerlength + 1,
          answerbody: answer,
          userid: user.result._id,
          useranswered: user.result.name
        }));
        setanswer("")
      }
    }
  }
  const handleshare = () => {
    copy(url + location.pathname);
    alert("Copied url :" + url + location.pathname)
  }

  const handledelete = () => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      dispatch(deletequestion(id, navigate))
    }
  }

  const handleStartEdit = (question) => {
    setIsEditing(true)
    setEditTitle(question.questiontitle)
    setEditBody(question.questionbody)
    setEditTags(question.questiontags.join(' '))
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditTitle("")
    setEditBody("")
    setEditTags("")
  }

  const handleSaveEdit = (e) => {
    e.preventDefault()
    if (!editTitle.trim() || !editBody.trim() || !editTags.trim()) {
      alert("Please fill all fields")
      return
    }
    const questionData = {
      questiontitle: editTitle,
      questionbody: editBody,
      questiontags: editTags.split(' ').filter(tag => tag.trim() !== '')
    }
    dispatch(editquestion(id, questionData, navigate))
    setIsEditing(false)
  }

  const handleupvote = () => {
    if (user === null) {
      alert("Login or Signup to answer a question")
      navigate('/Auth')
    } else {
      dispatch(votequestion(id, "upvote"))
    }
  }
  const handledownvote = () => {
    if (user === null) {
      alert("Login or Signup to answer a question")
      navigate('/Auth')
    } else {
      dispatch(votequestion(id, "downvote"))
    }
  }

  return (
    <div className="question-details-page">
      {questionlist.data === null ? (
        <h1>Loading...</h1>
      ) : (
        <>
          {questionlist.data.filter((question) => question._id === id).map((question) => (
            <div key={question._id}>
              <section className='question-details-container'>
                {isEditing ? (
                  // Edit Mode
                  <form onSubmit={handleSaveEdit} className="edit-question-form">
                    <div className="edit-form-group">
                      <label>Question Title:</label>
                      <input 
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="edit-input-title"
                        placeholder="Enter question title"
                      />
                    </div>
                    <div className="edit-form-group">
                      <label>Question Body:</label>
                      <textarea
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        className="edit-textarea-body"
                        rows="10"
                        placeholder="Enter question details"
                      />
                    </div>
                    <div className="edit-form-group">
                      <label>Tags (space separated):</label>
                      <input 
                        type="text"
                        value={editTags}
                        onChange={(e) => setEditTags(e.target.value)}
                        className="edit-input-tags"
                        placeholder="e.g. javascript react nodejs"
                      />
                    </div>
                    <div className="edit-form-buttons">
                      <button type="submit" className="save-edit-btn">
                        ✓ Save Changes
                      </button>
                      <button type="button" onClick={handleCancelEdit} className="cancel-edit-btn">
                        ✕ Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  // View Mode
                  <>
                    <h1>{question.questiontitle}</h1>
                    <div className="question-details-container-2">
                      <div className="question-votes">
                        <img src={upvote} alt="" width={18} className='votes-icon' onClick={handleupvote} />
                        <p>{question.upvote.length - question.downvote.length}</p>
                        <img src={downvote} alt="" width={18} className='votes-icon' onClick={handledownvote} />
                      </div>
                      <div style={{ width: "100%" }}>
                        <p className='question-body'>{question.questionbody}</p>
                        <div className="question-details-tags">
                          {question.questiontags.map((tag) => (
                            <p key={tag}>{tag}</p>
                          ))}
                        </div>
                        <div className="question-actions-user">
                          <div>
                            <button type='button' onClick={handleshare}>
                              Share
                            </button>
                            {user?.result?._id === question?.userid && (
                              <>
                                <button type='button' onClick={() => handleStartEdit(question)} style={{marginLeft: '5px'}}>
                                  ✏️ Edit
                                </button>
                                <button type='button' onClick={handledelete} style={{marginLeft: '5px'}}>
                                  🗑️ Delete
                                </button>
                              </>
                            )}
                          </div>
                          <div>
                            <p>Asked {moment(question.askedon).fromNow()}</p>
                            <Link to={`Users/${question.userid}`} className='user-limk' style={{ color: "#0086d8" }}>
                              <Avatar backgroundColor="orange" px="8px" py="5px" borderRadius="4px">
                                {question.userposted.charAt(0).toUpperCase()}
                              </Avatar>
                              <div>{question.userposted}</div>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </section>
              {question.noofanswers !== 0 && (
                <section>
                  <h3> {question.noofanswers} Answers </h3>
                  <Displayanswer key={question._id} question={question} handleshare={handleshare} />
                </section>
              )}
              <section className="post-ans-container">
                <h3>Your Answer</h3>
                <form onSubmit={(e) => {
                  handlepostans(e, question.answer.length)
                }}>
                  <textarea name="" id="" cols="30" rows="10" vlaue={answer} onChange={(e) => setanswer(e.target.value)}>
                  </textarea>
                  <br />
                  <input type="submit" className="post-ans-btn" value="Post your Answer" />
                </form>
                <p>Browse other Question tagged
                  {question.questiontags.map((tag) => (
                    <Link to="/Tags" key={tag} className='ans-tag'>
                      {" "}
                      {tag}{" "}
                    </Link>
                  ))}{" "}
                  or
                  <Link to="/Askquestion" style={{ textDecoration: "none", color: "#009dff" }}>
                    {" "}
                    Ask your own question
                  </Link>
                </p>
              </section>

            </div>
          ))}
        </>
      )}
    </div>
  )
}

export default Questiondetails
