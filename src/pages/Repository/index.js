import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../Components/Container/index';
import { Loading, Owner, IssueList, IssueFilter, Paging } from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    filters: [{ state: 'all' }, { state: 'open' }, { state: 'closed' }],
    filterIndex: 0,
    loading: true,
    page: 1,
  };

  async componentDidMount() {
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);
    /* 
    const response = await api.get(`/repos/${repoName}`)
    const issues = await api.get(`/repos/${repoName}/issues`)
    
    as duas requisições (response e issues)
    da api devem ser feitas ao mesmo tempo
    por isso o uso de Promise
    */
    const [repository, issues] = await Promise.all([
      // repository = 1st req,
      // issues = 2nd req
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'open',
          per_page: 5,
        },
      }),
    ]);
    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  handleFilter = async e => {
    await this.setState({
      filterIndex: e.target.value,
    });
    this.loadingIssues();
  };

  handlePages = async e => {
    const { page } = this.state;
    await this.setState({
      page: e.target.value === 'next' ? page + 1 : page - 1,
    });
    this.loadingIssues();
  };

  loadingIssues = async () => {
    // apenas para as issues
    const { match } = this.props;
    const { filters, filterIndex, page } = this.state;
    const repoName = decodeURIComponent(match.params.repository);
    const response = await api.get(`/repos/${repoName}/issues`, {
      params: {
        // os estados no filtro vão percorrer pelo filterIndex
        state: filters[filterIndex].state,
        per_page: 5,
        page,
      },
    });
    // data tem todas as props
    this.setState({ issues: response.data });
  };

  render() {
    const { repository, issues, loading, page } = this.state;
    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <IssueFilter onClick={this.handleFilter}>
          <button type="submit" value="0">
            Todas
          </button>

          <button type="submit" value="1">
            Abertas
          </button>

          <button type="submit" value="2">
            Fechadas
          </button>
        </IssueFilter>
        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {/** Labels */}
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <Paging onClick={this.handlePages}>
          <button type="submit" disabled={page < 2} value="back">
            Anterior
          </button>
          <span>Página {page}</span>

          <button type="submit" value="next">
            Proxima
          </button>
        </Paging>
      </Container>
    );
  }
}

/* 
 tried but failed:
 async componentDidUpdate(_, prevState) {
    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);
    const { filters, filterIndex } = this.state;

    if (prevState.filters !== filters.match) {
      const response = await api.get(`/repos/${repoName}/issues`, {
        this.state.issues = response.data,
        params: {
          state: filters[filterIndex].state,
        },
      });
    }
  } */
